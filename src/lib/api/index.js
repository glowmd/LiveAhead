/**
 * LiveAhead — API Barrel Export
 *
 * Single import point for all API modules:
 *   import { signIn, getProfile, listRoutines, getAllLogs } from '../lib/api';
 */

export { signUp, signIn, signOut, getSession, onAuthStateChange } from './auth.js';
export { getProfile, updateProfile } from './profiles.js';
export { listRoutines, createRoutine, updateRoutine, deleteRoutine } from './routines.js';
export { listRoutineItems, createRoutineItem, updateRoutineItem, deleteRoutineItem } from './routine-items.js';
export { getAllLogs, logHabit, unlogHabit, bulkInsertLogs } from './logs.js';
export { getUserSettings, upsertUserSettings } from './user-settings.js';
