import { Schema, model, models, Document } from 'mongoose';

// Define the role types
export type UserRoleType =
	| 'organizer'
	| 'volunteer'
	| 'speaker'
	| 'participant';

// Define permission types
export type PermissionType =
	| 'canManageEvent'
	| 'canVerifyTickets'
	| 'canViewAttendees'
	| 'canManageStakeholders'
	| 'canViewAnalytics'
	| 'canSendUpdates'
	| 'canManageCertificates'
	| 'canManageGallery';

// Interface for user role
export interface IUserRole extends Document {
	_id: string;
	user: Schema.Types.ObjectId;
	event: Schema.Types.ObjectId;
	role: UserRoleType;
	assignedAt: Date;
	assignedBy: Schema.Types.ObjectId;
	isActive: boolean;
	permissions?: {
		canManageEvent?: boolean;
		canVerifyTickets?: boolean;
		canViewAttendees?: boolean;
		canManageStakeholders?: boolean;
		canViewAnalytics?: boolean;
		canSendUpdates?: boolean;
		canManageCertificates?: boolean;
		canManageGallery?: boolean;
	};
	createdAt: Date;
	updatedAt: Date;
}

// User Role Schema
const userRoleSchema = new Schema<IUserRole>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		event: {
			type: Schema.Types.ObjectId,
			ref: 'Event',
			required: true,
		},
		role: {
			type: String,
			enum: ['organizer', 'volunteer', 'speaker', 'participant'],
			required: true,
		},
		assignedAt: {
			type: Date,
			default: Date.now,
		},
		assignedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		permissions: {
			canManageEvent: { type: Boolean, default: false },
			canVerifyTickets: { type: Boolean, default: false },
			canViewAttendees: { type: Boolean, default: false },
			canManageStakeholders: { type: Boolean, default: false },
			canViewAnalytics: { type: Boolean, default: false },
			canSendUpdates: { type: Boolean, default: false },
			canManageCertificates: { type: Boolean, default: false },
			canManageGallery: { type: Boolean, default: false },
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for better performance
userRoleSchema.index({ user: 1, event: 1 }, { unique: false }); // Allow multiple roles per user per event
userRoleSchema.index({ event: 1, role: 1 });
userRoleSchema.index({ user: 1, role: 1 });
userRoleSchema.index({ user: 1, isActive: 1 });

// Pre-save middleware to set default permissions based on role
userRoleSchema.pre('save', function (next) {
	if (this.isNew || this.isModified('role')) {
		switch (this.role) {
			case 'organizer':
				this.permissions = {
					canManageEvent: true,
					canVerifyTickets: true,
					canViewAttendees: true,
					canManageStakeholders: true,
					canViewAnalytics: true,
					canSendUpdates: true,
					canManageCertificates: true,
					canManageGallery: true,
				};
				break;
			case 'volunteer':
				this.permissions = {
					canManageEvent: false,
					canVerifyTickets: true,
					canViewAttendees: true,
					canManageStakeholders: false,
					canViewAnalytics: false,
					canSendUpdates: false,
					canManageCertificates: false,
					canManageGallery: false,
				};
				break;
			case 'speaker':
				this.permissions = {
					canManageEvent: false,
					canVerifyTickets: false,
					canViewAttendees: true,
					canManageStakeholders: false,
					canViewAnalytics: false,
					canSendUpdates: false,
					canManageCertificates: false,
					canManageGallery: true, // Speakers can manage their presentation materials
				};
				break;
			case 'participant':
				this.permissions = {
					canManageEvent: false,
					canVerifyTickets: false,
					canViewAttendees: false,
					canManageStakeholders: false,
					canViewAnalytics: false,
					canSendUpdates: false,
					canManageCertificates: false,
					canManageGallery: false,
				};
				break;
		}
	}
	next();
});

// Static method to get role permissions
userRoleSchema.statics.getRolePermissions = function (role: UserRoleType) {
	switch (role) {
		case 'organizer':
			return {
				canManageEvent: true,
				canVerifyTickets: true,
				canViewAttendees: true,
				canManageStakeholders: true,
				canViewAnalytics: true,
				canSendUpdates: true,
				canManageCertificates: true,
				canManageGallery: true,
			};
		case 'volunteer':
			return {
				canManageEvent: false,
				canVerifyTickets: true,
				canViewAttendees: true,
				canManageStakeholders: false,
				canViewAnalytics: false,
				canSendUpdates: false,
				canManageCertificates: false,
				canManageGallery: false,
			};
		case 'speaker':
			return {
				canManageEvent: false,
				canVerifyTickets: false,
				canViewAttendees: true,
				canManageStakeholders: false,
				canViewAnalytics: false,
				canSendUpdates: false,
				canManageCertificates: false,
				canManageGallery: true,
			};
		case 'participant':
			return {
				canManageEvent: false,
				canVerifyTickets: false,
				canViewAttendees: false,
				canManageStakeholders: false,
				canViewAnalytics: false,
				canSendUpdates: false,
				canManageCertificates: false,
				canManageGallery: false,
			};
		default:
			return {};
	}
};

const UserRole =
	models.UserRole || model<IUserRole>('UserRole', userRoleSchema);

export default UserRole;
export type UserRoleDocument = IUserRole & Document;
