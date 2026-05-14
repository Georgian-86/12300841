import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const EVAL_BASE = 'http://4.224.186.213/evaluation-service';
const TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN || process.env.ACCESS_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await axios.post(`${EVAL_BASE}/logs`, body, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API error posting logs:", error.response?.status, error.message);
    // Silent — don't fail the app if logging fails
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
