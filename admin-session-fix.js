/* Tonninyira single admin session layer */
(function(){
  'use strict';
  const SUPABASE_URL='https://alxzmjgepftohwpqibmn.supabase.co';
  const SUPABASE_KEY='sb_publishable_vLr2S8qLRHN5gVv9IITVPQ_CTXc4aCv';
  const APP_URL='https://cuepointe.github.io/tonninyira/';
  const GUIDE_URL=APP_URL+'admin-user-guide.html';
  let client;
  function getClient(){
    if(client)return client;
    try{
      if(window.supabaseClient?.auth)return client=window.supabaseClient;
      if(window.supabase?.createClient)return client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    }catch(e){}
    return null;
  }
  async function adminState(){
    const c=getClient();
    if(!c?.auth)return {ok:false,error:'Authentication is unavailable.'};
    try{
      let r=await c.auth.getSession();
      let user=r?.data?.session?.user||null;
      if(!user){r=await c.auth.getUser();user=r?.data?.user||null;}
      if(!user)return {ok:false,error:'No administrator session is active.'};
      const q=await c.rpc('admin_session_check');
      if(q.error)throw q.error;
      if(q.data?.ok)return {ok:true,user,role:q.data.role,display_name:q.data.display_name,phone:q.data.phone};
      return {ok:false,error:q.data?.error||'Administrator access could not be verified'};
    }catch(e){return {ok:false,error:e?.message||'Administrator access could not be verified'};}
  }
  async function logout(){
    try{await getClient()?.auth?.signOut({scope:'local'});}catch(e){}
    try{sessionStorage.clear();Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k));}catch(e){}
    location.replace(APP_URL+'index.html?signed_out=1');
  }
  function addGuideLink(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    nav.querySelectorAll('#tn-admin-guide-link,#tn-staff-guide,[data-tn-guide-link="1"]').forEach((e,i)=>{if(i>0)e.remove();});
    if(!document.getElementById('tn-admin-guide-link')){
      const b=document.createElement('button');b.id='tn-admin-guide-link';b.className='nav';b.dataset.tnGuideLink='1';b.textContent='Staff user guide';b.onclick=()=>location.href=GUIDE_URL;nav.appendChild(b);
    }
  }
  function applyPreferredView(){
    const target=sessionStorage.getItem('tnAdminPreferredView');
    if(!target)return;
    const b=document.querySelector('#nav button[data-view="'+target.replace(/[^a-z]/g,'')+'"]');
    if(b){sessionStorage.removeItem('tnAdminPreferredView');b.click();}
  }
  async function loadGuide(){
    const q=await getClient().rpc('admin_get_guide',{p_slug:'operations'});
    if(q.error)throw q.error;
    const g=Array.isArray(q.data)?q.data[0]:q.data;
    if(!g)throw new Error('Private guide content is not configured');
    const content=document.getElementById('content');
    if(!content)return;
    document.title=(g.title||'Tonninyira Admin User Guide')+' · Tonninyira';
    const stamp=g.updated_at?new Date(g.updated_at).toLocaleString():'—';
    content.innerHTML='<article class="card">'+String(g.content_html||'<h2>Guide content unavailable</h2>')+'<div class="callout" style="margin-top:24px"><strong>Last updated:</strong> '+stamp+'</div></article>';
  }
  async function repairTower(){
    const who=document.getElementById('who');
    if(!who)return;
    const s=await adminState();
    if(s.ok){
      who.textContent=(s.display_name||s.user.email||'Admin')+' · '+(s.role||'admin');
      addGuideLink();
    }else who.textContent='Admin access could not be verified';
    const b=document.getElementById('signout');
    if(b){b.disabled=false;b.style.pointerEvents='auto';b.onclick=logout;}
    setTimeout(applyPreferredView,150);
  }
  async function repairGuide(){
    const access=document.getElementById('access');
    if(!access)return;
    const s=await adminState();
    if(!s.ok){access.textContent='Admin access could not be verified';return;}
    access.textContent='Authorized '+(s.role==='staff'?'staff':'admin');
    const page=document.getElementById('page');if(page)page.style.display='block';
    try{await loadGuide();}catch(e){
      const content=document.getElementById('content');
      if(content)content.innerHTML='<div class="card"><h2>Guide could not be loaded</h2><p>'+String(e?.message||'Please refresh the page.')+'</p></div>';
    }
  }
  function boot(){
    if(document.getElementById('who'))repairTower();
    if(document.getElementById('access'))repairGuide();
    const b=document.getElementById('signout');if(b){b.disabled=false;b.style.pointerEvents='auto';b.onclick=logout;}
    addGuideLink();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,800);setTimeout(boot,2200);setTimeout(boot,5000);
  window.tnAdminClient=getClient;
  window.tnAdminLogout=logout;
  window.tnAdminState=adminState;
})();
