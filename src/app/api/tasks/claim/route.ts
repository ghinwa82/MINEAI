import { NextRequest, NextResponse } from 'next/server';
import { platformState } from '@/lib/state';

export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json();
    const task = platformState.tasks.find((t) => t.id === taskId);

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    if (task.completed) {
      return NextResponse.json({ success: false, error: 'Task already claimed for today' }, { status: 400 });
    }

    task.completed = true;
    const newBalance = platformState.addFunds(task.rewardUsd);

    return NextResponse.json({
      success: true,
      message: `Successfully claimed $${task.rewardUsd.toFixed(2)} USD!`,
      rewardAmount: task.rewardUsd,
      updatedBalance: newBalance,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Claim execution failure' }, { status: 500 });
  }
}