/**
 * LiveAhead — Simple Email Auth
 *
 * No Supabase Auth, no magic links, no passwords.
 * User identity is: email → UUID stored in the app_users table.
 * The UUID is cached in localStorage so returning users are recognised
 * without any network call on cold start.
 */

import { supabase } from '../supabase.js';

const USER_STORAGE_KEY = 'liveahead_user';

/**
 * Sign in (or sign up) with just an email address.
 * - If the email already exists → returns the existing user record.
 * - If it's new → creates a row and returns it.
 *
 * @param {string} email
 * @param {string} displayName   Only used when creating a new account.
 * @returns {Promise<{ data: { id, email, display_name } | null, error: string | null }>}
 */
export async function signInWithEmail(email, displayName) {
  const normalised = email.trim().toLowerCase();

  // --- Returning user? ---
  const { data: existing, error: lookupErr } = await supabase
    .from('app_users')
    .select('id, email, display_name')
    .eq('email', normalised)
    .maybeSingle();

  if (lookupErr) {
    return { data: null, error: 'Could not reach the server. Check your connection and try again.' };
  }

  if (existing) {
    // Update display_name if it was blank and one is supplied now
    if (displayName && !existing.display_name) {
      await supabase
        .from('app_users')
        .update({ display_name: displayName })
        .eq('id', existing.id);
      existing.display_name = displayName;
    }
    persistUser(existing);
    return { data: existing, error: null };
  }

  // --- New user ---
  const { data: created, error: insertErr } = await supabase
    .from('app_users')
    .insert({ email: normalised, display_name: displayName || '' })
    .select('id, email, display_name')
    .single();

  if (insertErr) {
    // Race condition: another tab created the row — retry the lookup
    if (insertErr.code === '23505') {
      const { data: retry } = await supabase
        .from('app_users')
        .select('id, email, display_name')
        .eq('email', normalised)
        .maybeSingle();
      if (retry) {
        persistUser(retry);
        return { data: retry, error: null };
      }
    }
    return { data: null, error: 'Could not create your account. Please try again.' };
  }

  // Create the user_settings row immediately so upserts later always find it
  await supabase
    .from('user_settings')
    .insert({ user_id: created.id })
    .select()
    .maybeSingle(); // ignore duplicate errors

  persistUser(created);
  return { data: created, error: null };
}

/**
 * Sign out — clears localStorage only. Supabase data is kept intact.
 */
export function signOut() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Returns the locally-cached user, or null if not signed in.
 * @returns {{ id: string, email: string, display_name: string } | null}
 */
export function getLocalUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save user to localStorage.
 */
function persistUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}
