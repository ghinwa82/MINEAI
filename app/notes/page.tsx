import type { Metadata } from 'next';

import NotesView from '../_views/notes';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const TITLE = 'Field notes — the agent ledger, written as it happens';
const DESCRIPTION =
  'Agent decisions, supplier margins and settlement events land in the MineAI ledger the moment they occur. Read them, keep them, or write your own.';

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/notes',
  keywords: ['AI agent log', 'supplier margin notes', 'dropshipping intelligence log'],
});

export default function NotesPage() {
  return (
    <PageShell>
      <NotesView />
    </PageShell>
  );
}
