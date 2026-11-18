import { NextResponse } from 'next/server';

import { providerStatuses, supabaseAuthConfigured } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Which social providers are actually switched on at the identity provider. */
export async function GET() {
  if (!supabaseAuthConfigured()) {
    return NextResponse.json({ ok: true, configured: false, providers: [] });
  }
  const providers = await providerStatuses();
  return NextResponse.json({
    ok: true,
    configured: true,
    providers: providers.map((provider) => ({
      id: provider.id,
      label: provider.label,
      enabled: provider.enabled,
      missing: provider.missing,
    })),
  });
}
