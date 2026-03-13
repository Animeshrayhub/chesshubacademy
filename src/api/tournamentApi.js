import { supabase } from '../services/supabase';

export async function getTournaments() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('date', { ascending: true });
  if (error) { console.error('getTournaments error:', error); return []; }
  return data;
}

export async function createTournament(tournament) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournaments')
    .insert([tournament])
    .select()
    .single();
  if (error) { console.error('createTournament error:', error); return null; }
  return data;
}

export async function updateTournament(id, updates) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournaments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateTournament error:', error); return null; }
  return data;
}

export async function deleteTournament(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('tournaments').delete().eq('id', id);
  if (error) { console.error('deleteTournament error:', error); return false; }
  return true;
}

export async function createRegistration(registration) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournament_registrations')
    .insert([registration])
    .select()
    .single();
  if (error) { console.error('createRegistration error:', error); return null; }
  return data;
}

export async function getRegistrations(tournamentId) {
  if (!supabase) return [];
  let query = supabase
    .from('tournament_registrations')
    .select('*, tournaments(name)')
    .order('created_at', { ascending: false });
  if (tournamentId) query = query.eq('tournament_id', tournamentId);
  const { data, error } = await query;
  if (error) { console.error('getRegistrations error:', error); return []; }
  return data;
}

export async function updateRegistrationStatus(id, status) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournament_registrations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateRegistrationStatus error:', error); return null; }
  return data;
}
