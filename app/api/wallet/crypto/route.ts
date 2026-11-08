import { NextResponse } from 'next/server';
import { validateCryptoAddress } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const chain = (body.chain === 'SOL' ? 'SOL' : 'EVM') as 'EVM' | 'SOL';
    const userWallet = body.userWallet ? String(body.userWallet) : '';

    if (userWallet && !validateCryptoAddress(userWallet, chain)) {
      return NextResponse.json({ error: 'Invalid user wallet address specified' }, { status: 422 });
    }

    const treasuryAddress =
      chain === 'SOL'
        ? (process.env.TREASURY_SOL_WALLET || 'MineAi7kX4hUeP98wYQvE1zR8sL7mM5nP6qD3fB2aC1')
        : (process.env.TREASURY_EVM_WALLET || '0x71C94b6e5fD8C618bF72088820B88c3a9f0B3e12');

    return NextResponse.json({
      success: true,
      chain,
      treasuryAddress,
      acceptedCurrencies: chain === 'SOL' ? ['SOL', 'USDC-SPL'] : ['ETH', 'USDT-ERC20', 'USDC'],
      qrCodeData: `ethereum:${treasuryAddress}?amount=100`,
      settlementTimeSeconds: 12
    });
  } catch {
    return NextResponse.json({ error: 'Failed to construct crypto deposit receiver' }, { status: 500 });
  }
}