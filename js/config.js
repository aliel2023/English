import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://wuzwvqgmrcqsiegbtrzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1end2cWdtcmNxc2llZ2J0cnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDUzOTAsImV4cCI6MjA2MjkyMTM5MH0.J4QMiApm6JwlfbYfDx6qBT2MHGp95WCuAw6X9LoSrqs';
export const supabase = createClient(supabaseUrl, supabaseKey);

export const GEMINI_API_KEY = 'AIzaSyDvH7wNLFVlkU3Lr_gIf-RD2iBzjVGFWSU';
export default supabase;
