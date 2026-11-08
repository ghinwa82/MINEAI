import { AgentBridge } from './agent-bridge';
import { AgentLog } from '../types';

export class SentimentVoiceAgent {
  public static async analyzeFeedback(content: string, userLanguage: string): Promise<AgentLog> {
    const systemPrompt = `You are an Autonomous AI Corporate Brand Guardian. Analyze the customer sentiment across 30 languages. Provide a short, context-aware corporate reply.`;
    const prompt = `Language: ${userLanguage}. Input message: "${content}". Categorize sentiment (POSITIVE, NEUTRAL, CRITICAL) and provide response.`;

    const response = await AgentBridge.executeAutonomousTask(prompt, systemPrompt);

    return {
      id: `sent-${Date.now()}`,
      agentName: 'SENTIMENT',
      timestamp: new Date().toISOString(),
      type: 'INFO',
      messageEn: `Sentiment audit completed. System synthesized response: ${response.substring(0, 100)}`,
      messageAr: `تم تدقيق نبرة المشاعر بنجاح. الرد المقترح: ${response.substring(0, 100)}`,
      metadata: { inputPreview: content.substring(0, 30), fullResponse: response }
    };
  }
}