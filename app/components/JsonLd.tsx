import React from 'react';

/**
 * Emits a JSON-LD payload for search engines.
 *
 * The string is escaped so a stray `<` inside a field can never break out of
 * the script tag, which would otherwise let content injection corrupt the
 * structured data block.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
