import { NextRequest, NextResponse } from 'next/server';

// Rate limiting map: store attempts per phone number
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, signal, emergency } = body;

    // Validate phone number format
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Rate limiting: max 10 alerts per phone per minute
    const now = Date.now();
    const limitKey = phoneNumber;
    const limit = rateLimitMap.get(limitKey);

    if (limit && now < limit.resetTime) {
      if (limit.count >= 10) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }
      limit.count++;
    } else {
      rateLimitMap.set(limitKey, {
        count: 1,
        resetTime: now + 60000, // Reset after 1 minute
      });
    }

    // Here you would integrate with SMS service like Twilio
    // For now, we'll log the alert
    console.log('[v0] SMS Alert would be sent to:', phoneNumber);
    console.log('[v0] Message:', message);
    console.log('[v0] Signal:', signal);
    console.log('[v0] Emergency:', emergency);

    // TODO: Integrate with Twilio or other SMS service
    // const response = await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER!,
    //   to: `+1${phoneNumber}`,
    // });

    return NextResponse.json(
      {
        success: true,
        message: 'Alert queued for delivery',
        phone: phoneNumber.slice(-4), // Return only last 4 digits for privacy
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Alert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
