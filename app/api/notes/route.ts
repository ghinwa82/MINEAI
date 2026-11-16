import { NextResponse } from 'next/server';

import { createNote, deleteNote, listNotes, type NoteCategory } from '@/lib/notes-store';
import { sanitizeMultiline, sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CATEGORIES: NoteCategory[] = ['arbitrage', 'supplier', 'stripe', 'telemetry'];

export async function GET() {
  try {
    const notes = await listNotes();
    return NextResponse.json({ ok: true, notes, count: notes.length });
  } catch {
    return NextResponse.json({ ok: false, error: 'The ledger could not be read' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = sanitizeMultiline(body?.title, 140);
    const content = sanitizeMultiline(body?.content, 4000);
    const rawCategory = sanitizeInput(body?.category);
    const category = (CATEGORIES as string[]).includes(rawCategory)
      ? (rawCategory as NoteCategory)
      : 'arbitrage';

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, error: 'A title and a body are required' },
        { status: 400 },
      );
    }

    const note = await createNote({ title, content, category });
    return NextResponse.json({ ok: true, note }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: 'The entry could not be written' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = sanitizeInput(new URL(request.url).searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ ok: false, error: 'An entry id is required' }, { status: 400 });
  }

  try {
    const removed = await deleteNote(id);
    return NextResponse.json({ ok: removed, id });
  } catch {
    return NextResponse.json({ ok: false, error: 'The entry could not be removed' }, { status: 500 });
  }
}
