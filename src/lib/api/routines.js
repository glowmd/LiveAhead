/**
 * LiveAhead — Routines API
 * 
 * CRUD operations for routines. Each routine belongs to a user
 * and is protected by Row Level Security.
 * All functions return { data, error } — never throw.
 */

import { supabase } from '../supabase.js';

/**
 * List all routines for a user, ordered by creation date.
 * @param {string} userId
 * @returns {Promise<{ data: Array|null, error: object|null }>}
 */
export async function listRoutines(userId) {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error: { message: 'Could not load your routines. Please try again.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Create a new routine.
 * @param {object} routine - { user_id, title, description?, schedule?, is_active? }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createRoutine(routine) {
  const { data, error } = await supabase
    .from('routines')
    .insert(routine)
    .select()
    .single();

  if (error) {
    return { data: null, error: { message: 'Could not create routine. Please try again.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Update an existing routine.
 * @param {string} id - Routine UUID
 * @param {object} updates - Fields to update: { title, description, schedule, is_active }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateRoutine(id, updates) {
  const { data, error } = await supabase
    .from('routines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: { message: 'Could not update routine. Please try again.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Delete a routine and all its items (cascade).
 * @param {string} id - Routine UUID
 * @returns {Promise<{ error: object|null }>}
 */
export async function deleteRoutine(id) {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: { message: 'Could not delete routine. Please try again.', raw: error } };
  }

  return { error: null };
}
