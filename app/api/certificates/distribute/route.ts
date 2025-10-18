import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserByClerkId } from '@/lib/actions/user.action';
import { distributeCertificatesViaEmail } from '@/lib/actions/certificate.action';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { eventId, role, templateId } = await request.json();

    if (!eventId || !role || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, role, templateId' },
        { status: 400 }
      );
    }

    // Distribute certificates via email
    const result = await distributeCertificatesViaEmail(
      eventId,
      role,
      templateId,
      userId // Use clerkId for organizer check
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error distributing certificates:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
