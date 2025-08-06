// app.js
import { supabase } from './supabaseClient.js';

// ---- HELPER: Get current user ----
async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ---- SIGN UP ----
export async function signupUser(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert('Signup successful! Please verify your email and log in.');
}

// ---- LOG IN ----
export async function loginUser(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else window.location.reload();
}

// ---- LOG OUT ----
export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.reload();
}

// ---- ADD TRADE ----
export async function saveTrade(tradeData) {
  const user = await getCurrentUser();
  if (!user) return alert('Not logged in!');
  const toSave = { ...tradeData, user_id: user.id };
  const { error } = await supabase.from('trades').insert([toSave]);
  if (error) alert(error.message);
  else alert('Trade saved!');
}

// ---- FETCH USER'S TRADES ----
export async function fetchMyTrades() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false });
  if (error) { alert(error.message); return []; }
  return data;
}

// ---- SAVE DAILY CONFIDENCE ----
export async function saveDailyConfidence(score) {
  const user = await getCurrentUser();
  if (!user) return alert('Log in first!');
  const today = new Date().toISOString().slice(0, 10);

  // Prevent double submit
  const { data: existing } = await supabase
    .from('confidence')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today);
  if (existing.length)
    return alert('Already set confidence for today.');

  const { error } = await supabase.from('confidence').insert([
    { user_id: user.id, date: today, confidence_score: score }
  ]);
  if (error) alert(error.message);
  else alert('Confidence submitted!');
}

// ---- FETCH USER'S CONFIDENCE ----
export async function fetchConfidenceEntries() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('confidence')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });
  if (error) { alert(error.message); return []; }
  return data;
}

// ── AUTH STATE HANDLER ──
supabase.auth.onAuthStateChange((_event, session
