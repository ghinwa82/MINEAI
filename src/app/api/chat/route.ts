import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();

    // 1. Check SaaS Usage Limits in Supabase
    const { data: userQuota } = await supabase
      .from('user_subscriptions')
      .select('tokens_remaining')
      .eq('user_id', userId)
      .single();

    if (userQuota && userQuota.tokens_remaining <= 0) {
      return NextResponse.json({ error: 'SaaS Limit Exceeded. Please upgrade plan.' }, { status: 403 });
    }

    // 2. Fetch AI Response from Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'qwen-2.5-coder-32b',
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '';

    // 3. Deduct usage tokens for monetization
    if (userQuota) {
      await supabase
        .from('user_subscriptions')
        .update({ tokens_remaining: userQuota.tokens_remaining - 1 })
        .eq('user_id', userId);
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
