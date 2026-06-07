const supabaseUrl = 'https://wuzwvqgmrcqsiegbtrzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1end2cWdtcmNxc2llZ2J0cnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDUzOTAsImV4cCI6MjA2MjkyMTM5MH0.J4QMiApm6JwlfbYfDx6qBT2MHGp95WCuAw6X9LoSrqs';

(function initSupabase() {
  if (window.supabase) {
    const { createClient } = window.supabase;
    window.supabaseClient = createClient(supabaseUrl, supabaseKey);
  } else {
    setTimeout(initSupabase, 100);
  }
})();

window.GEMINI_API_KEY = 'AIzaSyDvH7wNLFVlkU3Lr_gIf-RD2iBzjVGFWSU';
