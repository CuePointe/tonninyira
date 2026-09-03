window.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id);
  const show=id=>$(id)?.classList.remove('hidden');
  const hide=id=>$(id)?.classList.add('hidden');
  const sb2=window.supabase.createClient('https://alxzmjgepftohwpqibmn.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFseHptamdlcGZ0b3dwcWli bW4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NTk5ODU0NCwiZXhwIjoyMTAxNTc0NTQ0fQ.YvFQhCqL6spINPsyLs7lf7z5wxtnfi4U893ydWLXEaA'.replace(' ',''));
  function accountPanel(){
    if(!window.__tn_state) return;
    show('accountPanel');
    $('profileName').value=window.__tn_state.profile?.display_name||'';
    $('profilePhone').value=window.__tn_state.profile?.phone||'';
    $('accountState').textContent=window.__tn_state.session?'Signed in as '+(window.__tn_state.session.user.email||'customer'):'Sign in to continue';
    if(typeof window.loadSaved==='function')window.loadSaved();
  }
  $('account').onclick=()=>window.__tn_state?.session?accountPanel():show('auth');
  $('accountNav').onclick=accountPanel;
  $('savedNav').onclick=()=>{accountPanel();setTimeout(()=>$('savedPanel').scrollIntoView({behavior:'smooth'}),0)};
  $('rewardsNav').onclick=()=>{accountPanel();setTimeout(()=>$('rewardsPanel').scrollIntoView({behavior:'smooth'}),0)};
  $('ordersNav').onclick=()=>{accountPanel();setTimeout(()=>$('ordersPanel').scrollIntoView({behavior:'smooth'}),0)};
  $('shopNav').onclick=()=>{hide('accountPanel');hide('cart');scrollTo({top:0,behavior:'smooth'});};
  $('cartBtn').onclick=()=>{show('cart');if(typeof window.renderCart==='function')window.renderCart();};
});