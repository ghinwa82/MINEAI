'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';
import { useMesh } from '@/lib/use-mesh';
import type { NoteCategory, FieldNote } from '@/lib/notes-store';

/**
 * The ledger.
 *
 * Entries are read from and written to the notes API — the list is never a
 * local array pretending to be a database — while the resident agent feed
 * runs alongside it from the autonomous endpoint.
 */
export default function NotesView() {
  const { t, lang } = useI18n();
  const { state } = useMesh(15_000);

  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('arbitrage');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/notes', { cache: 'no-store' });
      if (!response.ok) throw new Error(`notes responded ${response.status}`);
      const payload = (await response.json()) as { notes: FieldNote[] };
      setNotes(payload.notes ?? []);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'notes unreachable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });
      const payload = (await response.json()) as { ok?: boolean; note?: FieldNote; error?: string };
      if (!response.ok || !payload.ok || !payload.note) {
        setError(payload.error ?? t.common.error);
        return;
      }
      setNotes((previous) => [payload.note as FieldNote, ...previous]);
      setTitle('');
      setContent('');
      setError(null);
    } catch {
      setError(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setNotes((previous) => previous.filter((note) => note.id !== id));
    try {
      await fetch(`/api/notes?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      void load();
    }
  };

  const categories: NoteCategory[] = ['arbitrage', 'supplier', 'stripe', 'telemetry'];

  return (
    <>
      {/* --------------------------------------------------------- Header */}
      <section className="grid gap-10 pb-14 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="mx-eyebrow">{t.notes.eyebrow}</p>
          <h1 className="mx-display mt-6">{t.notes.title}</h1>
          <p className="mx-lede mt-6 max-w-xl">{t.notes.lead}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#080d18]/80 p-5">
          <p className="text-[0.66rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
            {t.notes.feedTitle}
          </p>
          <ol className="mt-4 space-y-3">
            {(state?.cycle.lastObservations ?? []).map((observation, index) => (
              <li key={index} className="flex gap-2.5 text-[0.8rem] leading-snug text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
                <span>{observation}</span>
              </li>
            ))}
            {(state?.cycle.lastObservations ?? []).length === 0 ? (
              <li className="text-[0.8rem] text-ink-faint">{t.notes.feedEmpty}</li>
            ) : null}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- Composer */}
      <section className="mb-16">
        <form
          onSubmit={submit}
          className="rounded-[1.5rem] border border-white/10 bg-[#080d18] p-6 sm:p-8"
        >
          <h2 className="text-lg font-bold text-ink">{t.notes.composerTitle}</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1.6fr_0.6fr]">
            <label className="block">
              <span className="sr-only">{t.notes.titlePlaceholder}</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t.notes.titlePlaceholder}
                required
                className="w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-3 text-[0.9rem] text-ink outline-none transition placeholder:text-ink-faint focus:border-cyan/60"
              />
            </label>

            <label className="block">
              <span className="sr-only">{t.notes.categoryLabel}</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as NoteCategory)}
                className="w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-3 text-[0.9rem] text-ink outline-none transition focus:border-cyan/60"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {t.notes.categories[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="sr-only">{t.notes.bodyPlaceholder}</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t.notes.bodyPlaceholder}
              rows={4}
              required
              className="w-full resize-y rounded-xl border border-white/10 bg-[#050810] px-4 py-3 text-[0.9rem] leading-relaxed text-ink outline-none transition placeholder:text-ink-faint focus:border-cyan/60"
            />
          </label>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={saving} className="mx-btn">
              {saving ? `${t.notes.saving}…` : t.notes.save}
            </button>
            {error ? (
              <p role="alert" className="text-[0.8rem] text-rose">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      {/* --------------------------------------------------------- Ledger */}
      <section>
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group relative flex flex-col rounded-[1.35rem] border border-white/8 bg-[#080d18] p-6 transition hover:border-cyan/28"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="mx-chip">{t.notes.categories[note.category]}</span>
                <button
                  type="button"
                  onClick={() => remove(note.id)}
                  className="text-[0.68rem] text-ink-faint transition hover:text-rose"
                >
                  {t.notes.delete}
                </button>
              </div>

              <h3 className="mt-5 text-[1.05rem] leading-snug font-bold text-ink">{note.title}</h3>
              <p className="mt-3 flex-1 text-[0.85rem] leading-relaxed text-ink-mute">{note.content}</p>

              <p className="mx-numeric mt-6 text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
                {new Date(note.createdAt).toLocaleString(
                  lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US',
                  { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
                )}
              </p>
            </li>
          ))}
        </ol>

        {loading ? (
          <p className="mt-10 text-[0.85rem] text-ink-faint">{t.common.loading}…</p>
        ) : notes.length === 0 ? (
          <p className="mt-10 text-[0.9rem] text-ink-faint">{t.notes.empty}</p>
        ) : null}
      </section>
    </>
  );
}
