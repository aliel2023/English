// ═══════════════════════════════════════════════
// Supabase Client — Guaranteed Initialization
// ═══════════════════════════════════════════════
(function() {
  var SUPABASE_URL = 'https://wuzwvqgmrcqsiegbtrzs.supabase.co';
  var SUPABASE_KEY = 'sb_publishable__oRna7_MyCT4pFZ04GBDXw_HIW45cEL';

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
