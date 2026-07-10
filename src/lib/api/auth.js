/**
 * LiveAhead — Auth API
 * 
 * Email/password sign-up, sign-in, sign-out using Supabase Auth.
 * All functions return { data, error } — never throw.
 * 
 * The display_name is passed as user metadata on sign-up and
 * picked up by the database trigger to populate profiles.display_name.
 */

import { supabase } from '../supabase.js';

/**
 * Create a new account with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName - Stored in user metadata and auto-copied to profiles table
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function signUp(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName }
    }
  });

  if (error) {
    return { data: null, error: { message: friendlyError(error.message), raw: error } };
  }

  return { data, error: null };
}

/**
 * Sign in with existing email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { data: null, error: { message: friendlyError(error.message), raw: error } };
  }

  return { data, error: null };
}

/**
 * Sign out the current user.
 * @returns {Promise<{ error: object|null }>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: { message: 'Something went wrong signing out. Please try again.', raw: error } };
  }

  return { error: null };
}

/**
 * Get the current session (or null if not logged in).
 * @returns {Promise<{ session: object|null, error: object|null }>}
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { session: null, error: { message: error.message, raw: error } };
  }

  return { session: data.session, error: null };
}

/**
 * Subscribe to auth state changes (sign in, sign out, token refresh).
 * @param {Function} callback - Called with (event, session)
 * @returns {{ unsubscribe: Function }} - Call unsubscribe() to stop listening
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return { unsubscribe: () => subscription.unsubscribe() };
}

/**
 * Map Supabase error messages to user-friendly versions.
 */
function friendlyError(message) {
  const map = {
    'Invalid login credentials': "That email and password combination doesn\u2019t match our records.",
    'User already registered': 'An account with that email already exists. Try signing in instead.',
    'Password should be at least 6 characters': 'Please use a password with at least 6 characters.',
    'Signup requires a valid password': 'Please enter a password.',
  };

  for (const [key, friendly] of Object.entries(map)) {
    if (message.includes(key)) return friendly;
  }

  return message;
}
