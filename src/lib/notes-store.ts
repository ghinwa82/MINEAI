import { logEventToDatabase, readTable } from '@/lib/supabase';

export type NoteCategory = 'arbitrage' | 'supplier' | 'payout' | 'telemetry';

export interface FieldNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
}

const NOTE_CATEGORIES: NoteCategory[] = ['arbitrage', 'supplier', 'payout', 'telemetry'];

const SEED_NOTES: FieldNote[] = [
  {
    id: 'note-seed-1',
    title: 'Winning margin: portable hydro-mist fan',
    category: 'arbitrage',
    content:
      'Forty-two high-growth TikTok campaigns cleared 8.4M views. CJ Dropshipping landed the unit at $3.20; the same unit retails at $24.99 on Shopify. Net margin 68% before creative spend.',
    createdAt: new Date(Date.now() - 1000 * 60 * 41).toISOString(),
  },
  {
    id: 'note-seed-2',
    title: 'Bank off-ramp rules',
    category: 'payout',
    content:
      'Settlement runs daily at 00:00 UTC to the verified treasury account. Payouts above $250 need a fresh destination check; anything smaller clears on the next cycle.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
  },
  {
    id: 'note-seed-3',
    title: 'Thermal envelope under full dispatch',
    category: 'telemetry',
    content:
      'Node clusters held 99.98% hardware efficiency. Thermals stabilised at 62°C while a full multi-supplier order batch dispatched, with no throttling events recorded.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

interface NoteStore {
  notes: FieldNote[];
  hydrated: boolean;
}

const globalRef = globalThis as unknown as { __mineaiNotes?: NoteStore };

function store(): NoteStore {
  if (!globalRef.__mineaiNotes) {
    globalRef.__mineaiNotes = { notes: [...SEED_NOTES], hydrated: false };
  }
  return globalRef.__mineaiNotes;
}

function isNoteCategory(value: unknown): value is NoteCategory {
  return typeof value === 'string' && (NOTE_CATEGORIES as string[]).includes(value);
}

function coerceNote(raw: Record<string, unknown>): FieldNote | null {
  const title = typeof raw.title === 'string' ? raw.title : '';
  if (!title) return null;
  const content = typeof raw.content === 'string' ? raw.content : '';
  const category = isNoteCategory(raw.category) ? raw.category : 'arbitrage';
  const createdAt =
    typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString();
  return {
    id: typeof raw.id === 'string' ? raw.id : `note-${Date.now()}`,
    title,
    content,
    category,
    createdAt,
  };
}

/**
 * Hydrates the ledger from Supabase the first time it is touched. If the
 * remote table is unreachable the seeded ledger stays in place, so the notes
 * page never renders an empty shell.
 */
async function hydrate(): Promise<void> {
  const current = store();
  if (current.hydrated) return;
  current.hydrated = true;

  try {
    const remote = await readTable('notes');
    if (!remote || remote.length === 0) return;
    const parsed = remote
      .map((row) => coerceNote(row as Record<string, unknown>))
      .filter((note): note is FieldNote => note !== null);
    if (parsed.length > 0) {
      current.notes = parsed.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
  } catch {
    // Remote ledger unavailable — keep the local one.
  }
}

export async function listNotes(): Promise<FieldNote[]> {
  await hydrate();
  return [...store().notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createNote(input: {
  title: string;
  content: string;
  category: NoteCategory;
}): Promise<FieldNote> {
  await hydrate();
  const note: FieldNote = {
    id: `note-${Date.now().toString(36)}`,
    title: input.title,
    content: input.content,
    category: input.category,
    createdAt: new Date().toISOString(),
  };

  store().notes.unshift(note);

  await logEventToDatabase({
    table: 'notes',
    payload: {
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      created_at: note.createdAt,
    },
  });

  return note;
}

export async function deleteNote(id: string): Promise<boolean> {
  await hydrate();
  const current = store();
  const before = current.notes.length;
  current.notes = current.notes.filter((note) => note.id !== id);
  return current.notes.length < before;
}
