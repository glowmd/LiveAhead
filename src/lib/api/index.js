/**
 * LiveAhead — API Barrel Export
 * 
 * Single import point for all API modules:
 *   import { signIn, getProfile, listRoutines } from '../lib/api';
 */

export { signUp, signIn, signOut, getSession, onAuthStateChange } from './auth.js';
export { getProfile, updateProfile } from './profiles.js';
export { listRoutines, createRoutine, updateRoutine, deleteRoutine } from './routines.js';
export { listRoutineItems, createRoutineItem, updateRoutineItem, deleteRoutineItem } from './routine-items.js';
