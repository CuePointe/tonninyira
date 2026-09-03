/*
 * Tonninyira enhancement layer
 *
 * This file deliberately does NOT replace the original page structure.
 * It enhances the existing Eats / Shop tabs, search, basket, profile,
 * favourites, orders and market gallery in-place.
 */
(function () {
  'use strict';

  const CART_KEY = 'tonninyira_cart_v2';
  const SEARCH_KEY = 'tonninyira_recent_searches_v1';
  const REWARD_CACHE_KEY = 'tonninyira_reward_cache_v1';
  const originalAddToCart = typeof window.addToCart === 'function' ? window.addToCart : null;
  const originalUpdateQty = typeof window.updateQty === 'function' ? window.updateQty : null;
  const originalResetApp = typeof window.resetApp === 'function' ? window.resetApp : null;
  const originalRenderSearchResults = typeof window.renderSearchResults === 'function' ? window.renderSearchResults : null;
  const originalRenderMain = typeof window.renderMain === 'function' ? window.renderMain : null;
  const originalGoView = typeof window.goView === 'function' ? window.goView : null;

  function state() {
    return (typeof AppState !== 'undefined') ? AppState : null;
  }
  function catalog() {
    return (typeof CATALOG !== 'undefined') ? CATALOG : null;
  }
  function client() {
    return (typeof supabaseClient !== 'undefined') ? supabaseClient : null;
  }
  function icons() {
    return (typeof ICONS !== 'undefined') ? ICONS : {};
  }

  function safeParse(value, fallback) {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }

  function persistCart() {
    try {
      const s = state();
      localStorage.setItem(CART_KEY, JSON.stringify(s && Array.isArray(s.cart) ? s.cart : []));
    } catch (_) {}
  }

  function restoreCart() {
    try {
      const s = state();
      if (!s || !Array.isArray(s.cart)) return;
      const saved = safeParse(localStorage.getItem(CART_KEY), []);
      if (!Array.isArray(saved)) return;
      s.cart.splice(0, s.cart.length, ...saved);
      if (typeof window.updateCartUI === 'function') window.updateCartUI();
    } catch (_) {}
  }

  if (originalAddToCart) {
    window.addToCart = function (...args) {
      const result = originalAddToCart.apply(this, args);
      persistCart();
      return result;
    };
  }

  if (originalUpdateQty) {
    window.updateQty = function (...args) {
      const result = originalUpdateQty.apply(this, args);
      persistCart();
      return result;
    };
  }

  if (originalResetApp) {
    window.resetApp = function (...args) {
      const result = originalResetApp.apply(this, args);
      persistCart();
      return result;
    };
  }

  function recentSearches() {
    const value = safeParse(localStorage.getItem(SEARCH_KEY), []);
    return Array.isArray(value) ? value : [];
  }

  function saveRecentSearch(term) {
    term = String(term || '').trim();
    if (!term || term.length < 2) return;
    const next = [term, ...recentSearches().filter(x => x.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    try { localStorage.setItem(SEARCH_KEY, JSON.stringify(next)); } catch (_) {}
  }

  function enhancedSearchResults() {
    const el = document.getElementById('mainArea');
    const s = state();
    const c = catalog();
    if (!el || !s || !c) return;

    const term = String(s.searchTerm || '').trim().toLowerCase();
    if (!term) {
      if (originalRenderSearchResults) originalRenderSearchResults();
      return;
    }

    const normalize = value => String(value || '').toLowerCase();
    const tokens = term.split(/\s+/).filter(Boolean);
    const score = text => tokens.reduce((n, token) => n + (text.includes(token) ? 1 : 0), 0);
    const matches = [];

    Object.entries(c).forEach(([catKey, cat]) => {
      Object.entries(cat.subs || {}).forEach(([subKey, sub]) => {
        (sub.vendors || []).forEach(v => {
          const vendorText = [v.name, v.location, cat.label, sub.label].map(normalize).join(' ');
          (v.items || []).forEach(item => {
            const itemText = [item.name, item.desc, vendorText].map(normalize).join(' ');
            const rank = score(itemText);
            if (rank > 0) matches.push({ vendor: v, item, catKey, subKey, rank });
          });
        });
      });
    });

    matches.sort((a, b) => b.rank - a.rank || String(a.vendor.name).localeCompare(String(b.vendor.name)));
    if (!matches.length) {
      const clean = term.replace(/[&<>\"']/g, '');
      el.innerHTML = `<div class="empty-state">${icons().search || ''}<p style="font-weight:700;color:var(--sand);">Nothing matches "${clean}"</p><p>Try the name of a dish, item, stall or area.</p></div>`;
      saveRecentSearch(term);
      return;
    }

    const groups = new Map();
    matches.forEach(m => {
      const key = m.vendor.id;
      if (!groups.has(key)) groups.set(key, { ...m.vendor, catKey: m.catKey, subKey: m.subKey, items: [] });
      groups.get(key).items.push(m.item);
    });

    el.innerHTML = `<div class="stall-list">${[...groups.values()].map(v => window.vendorCardHTML(v)).join('')}</div>`;
    saveRecentSearch(term);
  }

  window.renderSearchResults = enhancedSearchResults;

  function enhanceAccessibility() {
    document.querySelectorAll('.cat-tab').forEach(btn => {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Browse ${btn.textContent.trim()}`);
    });
    document.querySelectorAll('.subcat-chip').forEach(btn => {
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', btn.textContent.trim());
    });
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.setAttribute('aria-label', 'Add item to basket');
      btn.title = 'Add to basket';
    });
    document.querySelectorAll('.fav-btn').forEach(btn => {
      btn.title = btn.classList.contains('active') ? 'Remove from favourite stalls' : 'Save this stall';
    });
    const search = document.getElementById('searchInput');
    if (search) {
      search.setAttribute('aria-label', 'Search stalls and items');
      search.setAttribute('inputmode', 'search');
      search.autocomplete = 'off';
    }
    const area = document.getElementById('areaSelect');
    if (area) area.setAttribute('aria-label', 'Your area');
  }

  function addSearchHint() {
    const search = document.getElementById('searchInput');
    if (!search || search.dataset.enhanced) return;
    search.dataset.enhanced = '1';
    search.addEventListener('keydown', e => {
      if (e.key === 'Enter') saveRecentSearch(search.value);
    });
  }

  async function loadRewards() {
    const db = client();
    if (!db || !db.auth || !db.auth.getSession) return null;
    try {
      const { data: sessionData } = await db.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return null;
      const { data, error } = await db.from('loyalty_accounts')
        .select('points,lifetime_points')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        localStorage.setItem(REWARD_CACHE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (_) {
      return safeParse(localStorage.getItem(REWARD_CACHE_KEY), null);
    }
    return null;
  }

  function injectProfileExtras() {
    const s = state();
    if (!s || s.view !== 'profile') return;
    const main = document.getElementById('mainArea');
    if (!main || main.querySelector('[data-tn-enhancements]')) return;

    const wrap = document.createElement('section');
    wrap.dataset.tnEnhancements = '1';
    wrap.style.cssText = 'padding:0 16px 24px;max-width:420px;margin:0 auto;';
    wrap.innerHTML = `
      <div style="background:var(--card);border-radius:14px;padding:14px;margin-top:8px;border:1px solid rgba(243,232,216,.08)">
        <div style="font-weight:800;color:var(--gold);margin-bottom:6px;">MY REWARDS</div>
        <div id="tnRewardsLine" style="font-weight:700;">Checking your points…</div>
        <div style="font-size:.76rem;color:var(--muted);margin-top:4px;">Earn points when completed orders are recorded.</div>
      </div>
      <div style="background:var(--card);border-radius:14px;padding:14px;margin-top:10px;border:1px solid rgba(243,232,216,.08)">
        <div style="font-weight:800;color:var(--gold);margin-bottom:6px;">SUPPORT</div>
        <div id="tnSupportStatus" style="font-size:.82rem;color:var(--muted);">Private support is available from your signed-in account.</div>
        <button id="tnSupportBtn" class="btn-primary" style="width:100%;margin-top:10px;">Open Support</button>
      </div>`;
    main.appendChild(wrap);

    const rewardLine = wrap.querySelector('#tnRewardsLine');
    loadRewards().then(reward => {
      if (!rewardLine) return;
      rewardLine.textContent = reward
        ? `Available: ${Number(reward.points || 0).toLocaleString()} points · Lifetime: ${Number(reward.lifetime_points || 0).toLocaleString()}`
        : 'Sign in to see your points.';
    });

    wrap.querySelector('#tnSupportBtn')?.addEventListener('click', async () => {
      const db = client();
      if (!db || !db.auth || !db.auth.getSession) {
        alert('Support is not available yet.');
        return;
      }
      const { data } = await db.auth.getSession();
      const session = data?.session;
      if (!session) {
        alert('Please use the existing Sign In option first.');
        return;
      }
      let convo;
      const found = await db.from('support_conversations')
        .select('id,status')
        .eq('customer_id', session.user.id)
        .eq('status', 'open')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (found.data) convo = found.data;
      else {
        const created = await db.from('support_conversations')
          .insert({ customer_id: session.user.id, status: 'open' })
          .select('id,status')
          .single();
        convo = created.data;
      }
      if (!convo) { alert('Could not open support right now.'); return; }
      const messages = await db.from('support_messages')
        .select('body,created_at,sender_user_id')
        .eq('conversation_id', convo.id)
        .order('created_at');
      const text = (messages.data || []).map(m => `${m.sender_user_id === session.user.id ? 'You' : 'Support'}: ${m.body}`).join('\n\n');
      const body = prompt(`Private support chat\n\n${text || 'No messages yet.'}\n\nType your message:`);
      if (!body?.trim()) return;
      await db.from('support_messages').insert({ conversation_id: convo.id, sender_user_id: session.user.id, body: body.trim() });
      alert('Message sent to Tonninyira Support.');
    });
  }

  function installProfileHook() {
    if (!originalRenderMain) return;
    window.renderMain = function (...args) {
      const result = originalRenderMain.apply(this, args);
      window.setTimeout(injectProfileExtras, 0);
      window.setTimeout(enhanceAccessibility, 0);
      return result;
    };
  }

  function installGoViewHook() {
    if (!originalGoView) return;
    window.goView = function (...args) {
      const result = originalGoView.apply(this, args);
      window.setTimeout(injectProfileExtras, 0);
      return result;
    };
  }

  function improveGallery() {
    const gallery = document.getElementById('heroTrack');
    if (!gallery || gallery.dataset.enhanced) return;
    gallery.dataset.enhanced = '1';
    gallery.setAttribute('aria-live', 'polite');
  }

  function refreshEnhancements() {
    restoreCart();
    addSearchHint();
    enhanceAccessibility();
    improveGallery();
  }

  installProfileHook();
  installGoViewHook();

  document.addEventListener('DOMContentLoaded', refreshEnhancements);
  window.setTimeout(refreshEnhancements, 250);
  window.setTimeout(refreshEnhancements, 1200);
})();
