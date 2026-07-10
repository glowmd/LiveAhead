/**
 * LiveAhead — Routine Items API
 * 
 * CRUD operations for individual items within a routine.
 * Items are cascade-deleted when their parent routine is deleted.
 * RLS is enforced via a join check on the parent routine's user_id.
 * All functions return { data, error } — never throw.
 */

import { supabase } from '../supabase.js';

/**
 * List all items for a routine, ordered by sort_order.
 * @param {string} routineId
 * @returns {Promise<{ data: Array|null, error: object|null }>}
 */
export async function listRoutineItems(routineId) {
  const { data, error } = await supabase
    .from('routine_items')
    .select('*')
    .eq('routine_id', routineId)
    .order('sort_order', { ascending: true });

  if (error) {
    return { data: null, error: { message: 'Could not load routine items. Please try again.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Create a new routine item.
 * @param {object} item - { routine_id, name, duration_minutes?, sort_order? }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createRoutineItem(item) {
  const { data, error } = await supabase
    .from('routine_items')
    .insert(item)
    .select()
    .single();

  if (error) {
    return { data: null, error: { message: 'Could not add item. Please try again.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Update a routine item.
 * @param {string} id - Item UUID
 * @param {object} updates - Fields to update: { name, duration_minutes, sort_order }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateRoutineItem(id, updates) {
  const { data, error } = await supabase
    .from('routine_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: { message: 'Could not update item. Please try again.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Delete a routine item.
 * @param {string} id - Item UUID
 * @returns {Promise<{ error: object|null }>}
 */
export async function deleteRoutineItem(id) {
  const { error } = await supabase
    .from('routine_items')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: { message: 'Could not delete item. Please try again.', raw: error } };
  }

  return { error: null };
}
