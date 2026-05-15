// js/config.js — Supabase Client (Alielenglish)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase layihə credential-ləri (anon key client-side üçün təhlükəsizdir — RLS qorunması var)
export const SUPABASE_URL = 'https://wuzwvqgmrcqsiegbtrzs.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1end2cWdtcmNxc2llZ2J0cnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDUzOTAsImV4cCI6MjA2MjkyMTM5MH0.J4QMiApm6JwlfbYfDx6qBT2MHGp95WCuAw6X9LoSrqs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
