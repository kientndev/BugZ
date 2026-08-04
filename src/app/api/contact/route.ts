import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, type, message } = await req.json();

    if (!name || !email || !type || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Log the contact inquiry details (Stub for email delivery/Slack hooks)
    console.log('[Contact Submission Received]:', { name, email, type, message });

    // This endpoint is ready for integrations like SendGrid, Mailgun, or Slack webhooks.

    return NextResponse.json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
