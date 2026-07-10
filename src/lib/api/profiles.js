/**
 * LiveAhead — Profiles API
 * 
 * Read and update user profiles. Profiles are auto-created on signup
 * by a database trigger, so there is no createProfile function.
 * All functions return { data, error } — never throw.
 */

import { supabase } from '../supabase.js';

/**
 * Get a user's profile by their user ID.
 * @param {string} userId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: { message: 'Could not load your profile. Please try again.', raw: error } };
  }

  return { data, error: null };
}

/**
 * Update a user's profile.
 * @param {string} userId
 * @param {object} updates - Fields to update: { username, display_name, avatar_url }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    // Handle unique constraint on username
    if (error.code === '23505' && error.message.includes('username')) {
      return { data: null, error: { message: 'That username is already taken. Try another one.', raw: error } };
    }
    return { data: null, error: { message: 'Could not update your profile. Please try again.', raw: error } };
  }

  return { data, error: null };
}
