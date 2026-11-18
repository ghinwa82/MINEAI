'use client';

import React from 'react';

import BrandLogo from './BrandLogo';

/**
 * Backwards-compatible alias for the brand lockup.
 *
 * Every surface that imported `Logo` before the identity overhaul now renders
 * the hexagonal quantum-node mark without touching its call site. New code
 * should import `BrandLogo` directly.
 */
export default function Logo({
  size = 'md',
  showTagline = true,
  href = '/',
}: {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
}) {
  return <BrandLogo size={size} showTagline={showTagline} href={href} />;
}
