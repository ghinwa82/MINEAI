'use client';

import React, { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <h1 className="text-xl font-bold font-mono">Product ID: {id}</h1>
    </div>
  );
}