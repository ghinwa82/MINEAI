import { GamificationState, AgentLog } from '../types';

export class GrowthHackingAgent {
  public static evaluateCheckIn(currentState: GamificationState): { updatedState: GamificationState; log: AgentLog } {
    const today = new Date().toISOString().slice(0, 10);
    let streak = currentState.streakDays;
    let earnedXp = 50;

    if (currentState.lastCheckInDate !== today) {
      streak += 1;
      earnedXp += streak * 25;
    }

    const nextXp = currentState.xp + earnedXp;
    const nextLevel = Math.floor(nextXp / 500) + 1;

    const updatedState: GamificationState = {
      ...currentState,
      streakDays: streak,
      xp: nextXp,
      level: nextLevel,
      lastCheckInDate: today
    };

    const log: AgentLog = {
      id: `gro-${Date.now()}`,
      agentName: 'GROWTH',
      timestamp: new Date().toISOString(),
      type: 'SUCCESS',
      messageEn: `Engagement bonus awarded: +${earnedXp} XP. Streak reached ${streak} consecutive days!`,
      messageAr: `تم منح مكافأة النشاط: +${earnedXp} نقطة خبرة. بلغت سلسلة الدخول ${streak} أيام متواصلة!`,
      metadata: { earnedXp, currentStreak: streak, newLevel: nextLevel }
    };

    return { updatedState, log };
  }
}