import { NextResponse } from 'next/server';
import { AgentBridge } from '@/lib/agents/agent-bridge';
import { z } from 'zod';

const RequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  systemPrompt: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    const parseResult = RequestSchema.safeParse(rawData);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD_STRUCTURE', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { prompt, systemPrompt } = parseResult.data;
    const aiResult = await AgentBridge.executeTask(prompt, systemPrompt);

    return NextResponse.json(aiResult, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'CRITICAL_INTERNAL_AGENT_ERROR';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}