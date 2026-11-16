import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import NotesView from '../../_views/notes';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getDictionary } from '@/lib/i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface LocaleNotesProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleNotesProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const dictionary = getDictionary(lang);

  return buildMetadata({
    title: dictionary.meta.notesTitle,
    description: dictionary.meta.notesDescription,
    path: '/notes',
    lang,
    keywords: ['AI agent log', 'supplier margin notes', 'dropshipping intelligence log'],
  });
}

export default async function LocaleNotesPage({ params }: LocaleNotesProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang) || lang === 'en') {
    notFound();
  }

  return (
    <PageShell>
      <NotesView />
    </PageShell>
  );
}
