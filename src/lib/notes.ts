import { supabase } from './supabase';

export type Note = {
  id: string;
  user_id: string | null;
  session_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export type NoteInput = Omit<Note, 'id' | 'created_at' | 'updated_at'>;

/**
 * Get all notes for a given session ID (or user ID if available)
 */
export async function getNotes(sessionId: string, userId: string | null = null): Promise<Note[]> {
  let query = supabase.from('notes').select('*').eq('session_id', sessionId);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as Note[]) || [];
}

/**
 * Get a single note by ID
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data as Note;
}

/**
 * Create a new note
 */
export async function createNote(note: NoteInput): Promise<Note> {
  const { data, error } = await supabase.from('notes').insert([note]).select('*').single();

  if (error) {
    throw error;
  }

  return data as Note;
}

/**
 * Update an existing note
 */
export async function updateNote(id: string, updates: Partial<NoteInput>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Note;
}

/**
 * Delete a note by ID
 */
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * Search notes by title or content (case-insensitive)
 */
export async function searchNotes(
  sessionId: string,
  query: string,
  userId: string | null = null
): Promise<Note[]> {
  let titleQuery = supabase
    .from('notes')
    .select('*')
    .eq('session_id', sessionId)
    .ilike('title', `%${query}%`);

  if (userId) {
    titleQuery = titleQuery.eq('user_id', userId);
  }

  // Also search in content
  const { data: contentData, error: contentError } = await supabase
    .from('notes')
    .select('*')
    .eq('session_id', sessionId)
    .ilike('content', `%${query}%`);

  if (contentError) {
    throw contentError;
  }

  const contentResults = (contentData as Note[]) || [];

  // Combine results and remove duplicates (by id)
  const { data: titleData, error: titleError } = await titleQuery;

  if (titleError) {
    throw titleError;
  }

  const titleResults = (titleData as Note[]) || [];

  // Merge and deduplicate
  const allNotes = [...titleResults, ...contentResults];
  const seen = new Set<string>();
  const uniqueNotes = allNotes.filter((note) => {
    if (seen.has(note.id)) {
      return false;
    }
    seen.add(note.id);
    return true;
  });

  // Sort by created_at descending
  return uniqueNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}