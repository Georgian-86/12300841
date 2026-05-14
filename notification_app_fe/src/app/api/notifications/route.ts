import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const EVAL_BASE = 'http://4.224.186.213/evaluation-service';
// Ensure we're reading the right env variable
const TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN || process.env.ACCESS_TOKEN || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const notification_type = searchParams.get('notification_type') || '';

  const params: Record<string, string> = { page, limit };
  if (notification_type) params.notification_type = notification_type;

  try {
    const response = await axios.get(`${EVAL_BASE}/notifications`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      params,
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("API error fetching notifications:", error.response?.status, error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
