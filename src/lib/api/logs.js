/**
 * LiveAhead — Habit Logs API
 *
 * Daily check-off storage backed by Supabase.
 * Each check-off is a row: (user_id, habit_id, logged_date).
 * Toggling = insert if absent, delete if present.
 */

import { supabase } from '../supabase.js';

/**
 * Fetch all logs for a user. Returns an object keyed by date string:
 * { '2026-07-10': ['sleep-well', 'move-daily'], ... }
 * @param {string} userId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getAllLogs(userId) {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, logged_date')
    .eq('user_id', userId)
    .order('logged_date', { ascending: true });

  if (error) {
    return { data: null, error: { message: 'Could not load your logs.', raw: error } };
  }

  // Group into { dateStr: [habitId, ...] }
  const grouped = {};
  for (const row of data) {
    const d = row.logged_date; // 'YYYY-MM-DD'
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(row.habit_id);
  }

  return { data: grouped, error: null };
}

/**
 * Mark a habit as done for a date (insert).
 * @param {string} userId
 * @param {string} habitId
 * @param {string} dateStr  'YYYY-MM-DD'
 */
export async function logHabit(userId, habitId, dateStr) {
  const { error } = await supabase
    .from('habit_logs')
    .insert({ user_id: userId, habit_id: habitId, logged_date: dateStr });

  if (error && error.code !== '23505') { // ignore unique constraint (already logged)
    return { error: { message: 'Could not save check-off.', raw: error } };
  }
  return { error: null };
}

/**
 * Un-mark a habit for a date (delete).
 * @param {string} userId
 * @param {string} habitId
 * @param {string} dateStr  'YYYY-MM-DD'
 */
export async function unlogHabit(userId, habitId, dateStr) {
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('logged_date', dateStr);

  if (error) {
    return { error: { message: 'Could not remove check-off.', raw: error } };
  }
  return { error: null };
}

/**
 * Bulk-insert logs (used for one-time localStorage migration).
 * @param {string} userId
 * @param {object} logsObj  { 'YYYY-MM-DD': ['habitId', ...] }
 */
export async function bulkInsertLogs(userId, logsObj) {
  const rows = [];
  for (const [date, habits] of Object.entries(logsObj)) {
    for (const habitId of habits) {
      rows.push({ user_id: userId, habit_id: habitId, logged_date: date });
    }
  }
  if (rows.length === 0) return { error: null };

  const { error } = await supabase
    .from('habit_logs')
    .upsert(rows, { onConflict: 'user_id,habit_id,logged_date' });

  if (error) {
    return { error: { message: 'Could not migrate existing logs.', raw: error } };
  }
  return { error: null };
}
