/* Tonninyira admin session recovery layer. Keeps Control Tower and Guide on one reliable auth path. */
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
    const c=getClient();if(!c?.auth)return {ok:false,error:'Authentication is unavailable.'};
    try{
      let r=await c.auth.getSession();
      let user=r?.data?.session?.user||null;
      if(!user){r=await c.auth.getUser();user=r?.data?.user||null;}
      if(!user)return {ok:false,error:'No administrator session is active.'};
      const profile=await c.from('profiles').select('role,display_name,phone').eq('id',user.id).maybeSingle();
      const p=profile.data;
      if(p&&(p.role==='admin'||p.role==='staff'))return {ok:true,user,profile:p};
      const member=await c.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
      if(member.data)return {ok:true,user,profile:p||{role:'admin'}};
      return {ok:false,error:'This signed-in account is not authorized for the admin workspace.'};
    }catch(e){return {ok:false,error:e?.message||'Could not verify administrator access.'};}
  }
  async function logout(){
    const c=getClient();try{if(c?.auth)await c.auth.signOut({scope:'local'});}catch(e){}
    try{sessionStorage.clear();Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k));}catch(e){}
    location.replace(APP_URL+'index.html');
  }
  function addGuideLink(){
    const nav=document.getElementById('nav');
    if(nav&&!document.getElementById('tn-admin-guide-link')){
      const b=document.createElement('button');b.id='tn-admin-guide-link';b.className='nav';b.textContent='Staff user guide';b.onclick=()=>location.href=GUIDE_URL;nav.appendChild(b);
    }
  }
  function renderGuide(g){
    const content=document.getElementById('content');if(!content||!g)return;
    const safe=String(g.content_html||'<h2>Guide content unavailable</h2><p>Please ask an administrator to configure the operations manual.</p>');
    const stamp=String(g.updated_at?new Date(g.updated_at).toLocaleString():'Now').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    content.innerHTML=`<article class="card">${safe}<div class="callout" style="margin-top:24px"><strong>Last updated:</strong> ${stamp}</div></article>`;
  }
  async function loadGuide(c){
    const q=await c.from('admin_guides').select('title,content_html,updated_at').eq('slug','operations').maybeSingle();
    if(q.error)throw q.error;if(!q.data)throw new Error('Private guide content is not configured');
    document.title=`${q.data.title} · Tonninyira`;renderGuide(q.data);
  }
  async function repairTower(){
    if(!document.getElementById('who'))return;
    const state=await adminState(),who=document.getElementById('who');
    if(state.ok){
      who.textContent=`${state.profile?.display_name||state.user.email||'Admin'} · ${state.profile?.role||'admin'}`;
      addGuideLink();
      const signout=document.getElementById('signout');if(signout){signout.onclick=logout;signout.disabled=false;signout.style.pointerEvents='auto';}
      if(typeof window.load==='function')try{await window.load('overview')}catch(e){}
    }else if(who.textContent.includes('Checking access')) who.textContent='Admin access could not be verified';
  }
  async function repairGuide(){
    if(!document.getElementById('access'))return;
    const state=await adminState(),access=document.getElementById('access');
    if(state.ok){
      access.textContent=`Authorized ${state.profile?.role==='staff'?'staff':'admin'}`;
      const page=document.getElementById('page');if(page)page.style.display='block';
      try{await loadGuide(getClient());}catch(e){
        const content=document.getElementById('content');
        if(content)content.innerHTML=`<div class="card"><h2>Guide could not be loaded</h2><p>${String(e?.message||'Please refresh the page.').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}</p></div>`;
      }
    }else if(access.textContent.includes('Checking admin')) access.textContent='Admin access could not be verified';
  }
  function boot(){repairTower();repairGuide();const signout=document.getElementById('signout');if(signout)signout.onclick=logout;addGuideLink();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,800);setTimeout(boot,2200);setTimeout(boot,5000);
  window.tnAdminLogout=logout;window.tnAdminState=adminState;
})();
