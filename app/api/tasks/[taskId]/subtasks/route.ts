import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { addSubtask } from '@/lib/actions/task.action';

// Zod schema for POST request (create subtask)
const createSubtaskSchema = z.object({
	eventId: z.string(),
	content: z.string().min(1, 'Subtask content is required'),
});

// POST - Create a new subtask
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ taskId: string }> }
) {
	const params = await context.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { eventId, content } = createSubtaskSchema.parse(body);

		const result = await addSubtask(eventId, userId, params.taskId, content);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		return NextResponse.json({
			success: true,
			subtask: result.subtask,
		});
	} catch (error) {
		console.error('Error creating subtask:', error);
		return NextResponse.json(
			{
				error: 'Failed to create subtask',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
