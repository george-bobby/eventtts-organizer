'use server';

import mongoose from 'mongoose';
import { connectToDatabase } from '../dbconnection';
import UserRole, { UserRoleType, IUserRole } from '../models/userrole.model';
import User from '../models/user.model';
import Event from '../models/event.model';
import { revalidatePath } from 'next/cache';

export interface CreateUserRoleParams {
	userId: string;
	eventId: string;
	role: UserRoleType;
	assignedBy: string;
}

export interface UpdateUserRoleParams {
	userRoleId: string;
	updates: Partial<IUserRole>;
}

export interface GetUserRolesParams {
	userId?: string;
	eventId?: string;
	role?: UserRoleType;
	isActive?: boolean;
}

/**
 * Create a new user role assignment
 */
export async function createUserRole(params: CreateUserRoleParams) {
	try {
		await connectToDatabase();

		// Check if user exists
		const user = await User.findById(params.userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Check if event exists
		const event = await Event.findById(params.eventId);
		if (!event) {
			throw new Error('Event not found');
		}

		// Check if role assignment already exists
		const existingRole = await UserRole.findOne({
			user: new mongoose.Types.ObjectId(params.userId),
			event: new mongoose.Types.ObjectId(params.eventId),
			role: params.role,
			isActive: true,
		});

		if (existingRole) {
			throw new Error(`User already has the role '${params.role}' for this event`);
		}

		const userRole = await UserRole.create({
			user: new mongoose.Types.ObjectId(params.userId),
			event: new mongoose.Types.ObjectId(params.eventId),
			role: params.role,
			assignedBy: new mongoose.Types.ObjectId(params.assignedBy),
		});

		await userRole.populate([
			{ path: 'user', select: 'firstName lastName email' },
			{ path: 'event', select: 'title' },
			{ path: 'assignedBy', select: 'firstName lastName' },
		]);

		revalidatePath(`/event/${params.eventId}`);
		revalidatePath('/dashboard');

		return JSON.parse(JSON.stringify(userRole));
	} catch (error) {
		console.error('Error creating user role:', error);
		throw error;
	}
}

/**
 * Get user roles based on filters
 */
export async function getUserRoles(params: GetUserRolesParams = {}) {
	try {
		await connectToDatabase();

		const query: any = {};

		if (params.userId) {
			query.user = new mongoose.Types.ObjectId(params.userId);
		}

		if (params.eventId) {
			query.event = new mongoose.Types.ObjectId(params.eventId);
		}

		if (params.role) {
			query.role = params.role;
		}

		if (params.isActive !== undefined) {
			query.isActive = params.isActive;
		}

		const userRoles = await UserRole.find(query)
			.populate('user', 'firstName lastName email photo')
			.populate('event', 'title startDate endDate')
			.populate('assignedBy', 'firstName lastName')
			.sort({ createdAt: -1 });

		return JSON.parse(JSON.stringify(userRoles));
	} catch (error) {
		console.error('Error getting user roles:', error);
		throw error;
	}
}

/**
 * Get events by user role
 */
export async function getEventsByUserRole(userId: string, role?: UserRoleType) {
	try {
		await connectToDatabase();

		const query: any = {
			user: new mongoose.Types.ObjectId(userId),
			isActive: true,
		};

		if (role) {
			query.role = role;
		}

		const userRoles = await UserRole.find(query)
			.populate({
				path: 'event',
				populate: [
					{ path: 'organizer', select: 'firstName lastName' },
					{ path: 'category', select: 'name' },
				],
			})
			.sort({ 'event.startDate': 1 });

		// Group events by role
		const eventsByRole: Record<string, any[]> = {
			organizer: [],
			volunteer: [],
			speaker: [],
			participant: [],
		};

		userRoles.forEach((userRole) => {
			if (userRole.event) {
				eventsByRole[userRole.role].push({
					...userRole.event,
					userRole: {
						_id: userRole._id,
						role: userRole.role,
						assignedAt: userRole.assignedAt,
						permissions: userRole.permissions,
					},
				});
			}
		});

		return JSON.parse(JSON.stringify(eventsByRole));
	} catch (error) {
		console.error('Error getting events by user role:', error);
		throw error;
	}
}

/**
 * Check if user has specific permission for an event
 */
export async function checkUserPermission(
	userId: string,
	eventId: string,
	permission: keyof IUserRole['permissions']
): Promise<boolean> {
	try {
		await connectToDatabase();

		const userRole = await UserRole.findOne({
			user: new mongoose.Types.ObjectId(userId),
			event: new mongoose.Types.ObjectId(eventId),
			isActive: true,
		});

		if (!userRole || !userRole.permissions) {
			return false;
		}

		return userRole.permissions[permission] || false;
	} catch (error) {
		console.error('Error checking user permission:', error);
		return false;
	}
}

/**
 * Get user's highest role for an event
 */
export async function getUserHighestRole(userId: string, eventId: string): Promise<UserRoleType | null> {
	try {
		await connectToDatabase();

		const userRoles = await UserRole.find({
			user: new mongoose.Types.ObjectId(userId),
			event: new mongoose.Types.ObjectId(eventId),
			isActive: true,
		});

		if (userRoles.length === 0) {
			return null;
		}

		// Role hierarchy: organizer > volunteer > speaker > participant
		const roleHierarchy: Record<UserRoleType, number> = {
			organizer: 4,
			volunteer: 3,
			speaker: 2,
			participant: 1,
		};

		let highestRole: UserRoleType = 'participant';
		let highestRoleValue = 0;

		userRoles.forEach((userRole) => {
			const roleValue = roleHierarchy[userRole.role];
			if (roleValue > highestRoleValue) {
				highestRoleValue = roleValue;
				highestRole = userRole.role;
			}
		});

		return highestRole;
	} catch (error) {
		console.error('Error getting user highest role:', error);
		return null;
	}
}

/**
 * Update user role
 */
export async function updateUserRole(params: UpdateUserRoleParams) {
	try {
		await connectToDatabase();

		const userRole = await UserRole.findByIdAndUpdate(
			params.userRoleId,
			params.updates,
			{ new: true }
		).populate([
			{ path: 'user', select: 'firstName lastName email' },
			{ path: 'event', select: 'title' },
		]);

		if (!userRole) {
			throw new Error('User role not found');
		}

		revalidatePath(`/event/${userRole.event._id}`);
		revalidatePath('/dashboard');

		return JSON.parse(JSON.stringify(userRole));
	} catch (error) {
		console.error('Error updating user role:', error);
		throw error;
	}
}

/**
 * Remove user role
 */
export async function removeUserRole(userRoleId: string) {
	try {
		await connectToDatabase();

		const userRole = await UserRole.findByIdAndUpdate(
			userRoleId,
			{ isActive: false },
			{ new: true }
		);

		if (!userRole) {
			throw new Error('User role not found');
		}

		revalidatePath(`/event/${userRole.event}`);
		revalidatePath('/dashboard');

		return JSON.parse(JSON.stringify(userRole));
	} catch (error) {
		console.error('Error removing user role:', error);
		throw error;
	}
}

/**
 * Assign role to user when they become a stakeholder
 */
export async function assignRoleFromStakeholder(
	userId: string,
	eventId: string,
	stakeholderRole: string,
	assignedBy: string
) {
	try {
		// Map stakeholder roles to user roles
		const roleMapping: Record<string, UserRoleType> = {
			organizer: 'organizer',
			volunteer: 'volunteer',
			speaker: 'speaker',
			attendee: 'participant',
			sponsor: 'participant', // Sponsors are treated as participants for now
		};

		const userRole = roleMapping[stakeholderRole];
		if (!userRole) {
			console.warn(`Unknown stakeholder role: ${stakeholderRole}`);
			return null;
		}

		// Check if user already has this role
		const existingRole = await UserRole.findOne({
			user: new mongoose.Types.ObjectId(userId),
			event: new mongoose.Types.ObjectId(eventId),
			role: userRole,
			isActive: true,
		});

		if (existingRole) {
			return existingRole;
		}

		// Create the role assignment
		return await createUserRole({
			userId,
			eventId,
			role: userRole,
			assignedBy,
		});
	} catch (error) {
		console.error('Error assigning role from stakeholder:', error);
		throw error;
	}
}
