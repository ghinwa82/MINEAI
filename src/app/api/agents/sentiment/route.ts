import { NextResponse } from 'next/server';
import { z } from 'zod';
import { StrixGuard } from '@/lib/security/strix-guard';
import { SentimentVoiceAgent } from '@/lib/agents/sentiment-agent';

const Schema = z.object({
  content: z.string().min(3).max(500),
  language: z.string().min(2).max(10),
  timestamp: z.number()
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const validation = StrixGuard.validatePayload(Schema, raw);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { content, language, timestamp } = validation.data;
    if (!StrixGuard.verifyAntiReplay(timestamp, 120)) {
      return NextResponse.json({ error: 'EXPIRED_SECURITY_TOKEN' }, { status: 403 });
    }

    const agentLog = await SentimentVoiceAgent.analyzeFeedback(content, language);
    return NextResponse.json({ success: true, log: agentLog });
  } catch {
    return NextResponse.json({ error: 'SENTIMENT_INFERENCE_FAILED' }, { status: 500 });
  }
}