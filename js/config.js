// ═══════════════════════════════════════════════
// Supabase Client Initialization
// ═══════════════════════════════════════════════
(function() {
  var SUPABASE_URL = 'https://wuzwvqgmrcqsiegbtrzs.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1end2cWdtcmNxc2llZ2J0cnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDUzOTAsImV4cCI6MjA2MjkyMTM5MH0.J4QMiApm6JwlfbYfDx6qBT2MHGp95WCuAw6X9LoSrqs';

  function init() {
    if (typeof supabase !== 'undefined' && supabase && supabase.createClient) {
      window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return true;
    }
    return false;
  }

  if (!init()) {
    var retryInterval = setInterval(function() {
      if (init()) {
        clearInterval(retryInterval);
      }
    }, 100);
    setTimeout(function() { clearInterval(retryInterval); }, 15000);
  }
})();

window.GEMINI_API_KEY = 'AIzaSyDvH7wNLFVlkU3Lr_gIf-RD2iBzjVGFWSU';
