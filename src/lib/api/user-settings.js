/**
 * LiveAhead — User Settings API
 *
 * Reads and writes the user_settings table in Supabase.
 * This covers goals, active habits, onboarding state, and dark mode.
 */

import { supabase } from '../supabase.js';

/**
 * Fetch settings for a user. Returns null if not yet created.
 * @param {string} userId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Row doesn't exist yet — return empty defaults
    return { data: null, error: null };
  }

  if (error) {
    return { data: null, error: { message: 'Could not load settings.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Upsert settings for a user.
 * @param {string} userId
 * @param {object} updates — any subset of: { goals, active_habits, onboarding_complete, share_dismissed, dark_mode }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function upsertUserSettings(userId, updates) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    return { data: null, error: { message: 'Could not save settings.', raw: error } };
  }

  return { data, error: null };
}
