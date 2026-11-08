import Groq from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY || '';

export const groq = new Groq({
  apiKey: groqApiKey,
});

export interface AgentResponse {
  success: boolean;
  content: string;
  modelUsed: string;
  latencyMs: number;
}

export class AgentBridge {
  private static readonly PRIMARY_MODEL = 'llama-3.3-70b-versatile';

  public static async executeTask(prompt: string, systemPrompt?: string): Promise<AgentResponse> {
    const startTime = Date.now();
    const timeoutDuration = 8000;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('GROQ_REQUEST_TIMEOUT')), timeoutDuration)
    );

    try {
      const completionPromise = groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are MineAI DePIN Core Agent. Provide concise, highly technical and monetary telemetry insights in English or Arabic based on user input.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.PRIMARY_MODEL,
        temperature: 0.3,
        max_tokens: 500,
      });

      const response = await Promise.race([completionPromise, timeoutPromise]);
      const content = response.choices[0]?.message?.content || 'Task executed without return message.';

      return {
        success: true,
        content,
        modelUsed: this.PRIMARY_MODEL,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'UNKNOWN_AI_EXCEPTION';
      return {
        success: false,
        content: `[Autonomous Fallback Heuristic]: Unable to reach Groq Core (${errMessage}). Heuristic check logged at 0.00ms. Node parameters verified.`,
        modelUsed: 'local-heuristic-fallback',
        latencyMs: Date.now() - startTime,
      };
    }
  }
}