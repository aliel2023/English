// ═══════════════════════════════════════════════
// Supabase Client — Guaranteed Initialization
// ═══════════════════════════════════════════════
(function() {
  var SUPABASE_URL = 'https://wuzwvqgmrcqsiegbtrzs.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1end2cWdtcmNxc2llZ2J0cnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDUzOTAsImV4cCI6MjA2MjkyMTM5MH0.J4QMiApm6JwlfbYfDx6qBT2MHGp95WCuAw6X9LoSrqs';

  var MAX_WAIT = 10000; // 10 saniyə
  var CHECK_INTERVAL = 50; // 50ms
  var waited = 0;

  function tryInit() {
    if (typeof window.supabase !== 'undefined' && window.supabase && window.supabase.createClient) {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      window.dispatchEvent(new CustomEvent('supabaseReady'));
      return true;
    }
    return false;
  }

  if (!tryInit()) {
    var interval = setInterval(function() {
      waited += CHECK_INTERVAL;
      if (tryInit()) {
        clearInterval(interval);
      } else if (waited >= MAX_WAIT) {
        clearInterval(interval);
        console.error('[Config] Supabase SDK yüklənmədi. CDN əlçatmazdır.');
        window.dispatchEvent(new CustomEvent('supabaseFailed'));
      }
    }, CHECK_INTERVAL);
  }

  window.GEMINI_API_KEY = 'AIzaSyDvH7wNLFVlkU3Lr_gIf-RD2iBzjVGFWSU';
})();
