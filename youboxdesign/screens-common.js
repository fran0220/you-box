/* Shared markup helpers + demo data for YouBox screens.
   Everything returns HTML strings. Loaded before screen files. */
window.YB = (function () {
  const markSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-5 9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>';

  const brand = () =>
    `<div class="brand"><span class="brand__mark">${markSvg}</span>You<b>Box</b></div>`;

  // Marketing top nav (public site)
  function navMarketing(active) {
    const links = [['models','Models'],['rankings','Rankings'],['pricing','Pricing'],['docs','Docs'],['chat','Chat']];
    return `<nav class="nav"><div class="nav__in">
      ${brand()}
      <div class="nav__links">${links.map(([id,l])=>`<span class="nav__link ${id===active?'nav__link--active':''}">${l}</span>`).join('')}</div>
      <div class="nav__sp"></div>
      <div class="nav__right">
        <div class="nav__search"><i data-lucide="search"></i><span>Search models</span><kbd>/</kbd></div>
        <span class="nav__icon" title="Theme"><i data-lucide="moon"></i></span>
        <a class="btn btn--ghost btn--sm">Sign in</a>
        <a class="btn btn--primary btn--sm">Get API key <i data-lucide="arrow-right"></i></a>
      </div>
    </div></nav>`;
  }

  // App top nav (authenticated console — lean, no sidebar)
  function navApp(active) {
    const links = [['dashboard','Dashboard'],['models','Models'],['activity','Activity'],['keys','API Keys'],['playground','Playground']];
    return `<nav class="nav"><div class="nav__in">
      ${brand()}
      <div class="nav__links">${links.map(([id,l])=>`<span class="nav__link ${id===active?'nav__link--active':''}">${l}</span>`).join('')}</div>
      <div class="nav__sp"></div>
      <div class="nav__right">
        <div class="nav__search" style="width:180px"><i data-lucide="search"></i><span>Search</span><kbd>/</kbd></div>
        <span class="credit-pill"><span class="dot"></span>$248.10<i data-lucide="plus"></i></span>
        <span class="nav__icon" title="Notifications"><i data-lucide="bell"></i></span>
        <span class="nav__icon" title="Theme"><i data-lucide="moon"></i></span>
        <span class="avatar">JD</span>
      </div>
    </div></nav>`;
  }

  // Admin nav adds admin sections
  function navAdmin(active) {
    const links = [['dashboard','Dashboard'],['channels','Channels'],['users','Users'],['activity','Logs'],['settings','Settings']];
    return `<nav class="nav"><div class="nav__in">
      ${brand()}
      <span class="badge badge--brand" style="margin-left:-12px">ADMIN</span>
      <div class="nav__links">${links.map(([id,l])=>`<span class="nav__link ${id===active?'nav__link--active':''}">${l}</span>`).join('')}</div>
      <div class="nav__sp"></div>
      <div class="nav__right">
        <div class="nav__search" style="width:180px"><i data-lucide="search"></i><span>Search</span><kbd>/</kbd></div>
        <span class="nav__icon"><i data-lucide="moon"></i></span>
        <span class="avatar">AD</span>
      </div>
    </div></nav>`;
  }

  function footer() {
    const cols = [
      ['Product', ['Models','Pricing','Rankings','Changelog','Status']],
      ['Developers', ['Documentation','API reference','SDKs','Quickstart','Limits']],
      ['Company', ['About','Blog','Careers','Contact','Terms']],
    ];
    return `<footer style="border-top:1px solid var(--border);padding:56px 0 36px;margin-top:32px">
      <div class="yb-wrap" style="display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:36px">
        <div>
          <div class="brand" style="font-size:18px">${markSvg ? `<span class="brand__mark">${markSvg}</span>`:''}You<b>Box</b></div>
          <p style="font-size:13px;color:var(--text-muted);margin:14px 0 0;max-width:26em;line-height:1.55">
            每一个模型，一个接口。The unified gateway to every frontier LLM — one OpenAI-compatible endpoint, 300+ models.</p>
        </div>
        ${cols.map(([h,items])=>`<div><h4 style="font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin:0 0 14px;font-weight:500">${h}</h4>${items.map(i=>`<a style="display:block;font-size:14px;color:var(--text-secondary);margin-bottom:10px">${i}</a>`).join('')}</div>`).join('')}
      </div>
      <div class="yb-wrap" style="display:flex;align-items:center;justify-content:space-between;margin-top:44px;padding-top:24px;border-top:1px solid var(--divider);font-size:13px;color:var(--text-muted)">
        <span>© 2026 YouBox Inc. · 沪ICP备 2026010101 号</span>
        <span style="display:flex;gap:18px"><span>Privacy</span><span>Terms</span><span>Security</span></span>
      </div>
    </footer>`;
  }

  const MODELS = [
    { id:'claude-opus-46', name:'Claude Opus 4.6', prov:'Anthropic', logo:'AN', cat:'Chat', desc:'Frontier reasoning model with state-of-the-art coding and long-horizon agentic performance.', tags:['vision','tools','200K ctx'], ctx:'200K', pin:3.0, pout:15.0, tps:118, badge:'New' },
    { id:'gpt-52', name:'GPT-5.2', prov:'OpenAI', logo:'OA', cat:'Chat', desc:'General-purpose multimodal flagship with fast streaming and broad tool support.', tags:['vision','tools','audio'], ctx:'256K', pin:2.5, pout:10.0, tps:142 },
    { id:'gemini-3-pro', name:'Gemini 3 Pro', prov:'Google', logo:'GO', cat:'Chat', desc:'Long-context multimodal model tuned for documents, video, and retrieval-heavy workloads.', tags:['vision','1M ctx','tools'], ctx:'1M', pin:1.25, pout:5.0, tps:96 },
    { id:'llama-4-405b', name:'Llama 4 405B', prov:'Meta', logo:'ME', cat:'Chat', desc:'Open-weights flagship. Self-hostable, with strong reasoning at an aggressive price point.', tags:['open','tools','128K ctx'], ctx:'128K', pin:0.9, pout:0.9, tps:84 },
    { id:'mistral-large-3', name:'Mistral Large 3', prov:'Mistral', logo:'MI', cat:'Chat', desc:'European frontier model with excellent multilingual coverage and function calling.', tags:['tools','multilingual'], ctx:'128K', pin:2.0, pout:6.0, tps:110 },
    { id:'deepseek-v4', name:'DeepSeek V4', prov:'DeepSeek', logo:'DS', cat:'Chat', desc:'Cost-efficient reasoning model with a dedicated chain-of-thought mode.', tags:['reasoning','open'], ctx:'128K', pin:0.27, pout:1.1, tps:72, badge:'Cheap' },
    { id:'flux-pro', name:'FLUX 1.2 Pro', prov:'Black Forest', logo:'BF', cat:'Image', desc:'High-fidelity text-to-image generation with sharp typography and prompt adherence.', tags:['image','512px–2K'], ctx:'—', pin:null, pout:null, tps:null },
    { id:'qwen-3-max', name:'Qwen 3 Max', prov:'Alibaba', logo:'QW', cat:'Chat', desc:'Bilingual frontier model with strong Chinese and English reasoning, tuned for agents.', tags:['vision','tools','中文'], ctx:'256K', pin:1.2, pout:4.8, tps:104, badge:'热门' },
  ];

  function favStar(on){return `<span class="mcard__fav ${on?'mcard__fav--on':''}"><i data-lucide="star"></i></span>`;}
  function modelCard(m, fav) {
    return `<div class="mcard">
      <div class="mcard__head">
        <div class="mcard__logo">${m.logo}</div>
        <div class="mcard__t">
          <div class="mcard__name">${m.name}${m.badge?`<span class="badge badge--brand">${m.badge}</span>`:''}</div>
          <div class="mcard__by">${m.prov}${m.ctx&&m.ctx!=='—'?` · ${m.ctx} context`:''}</div>
        </div>
        ${favStar(fav)}
      </div>
      <p class="mcard__desc">${m.desc}</p>
      <div class="mcard__tags">${m.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="mcard__foot">
        <div class="metric"><span class="k">Input / 1M</span><span class="v">${m.pin!=null?`<b>$${m.pin}</b>`:'—'}</span></div>
        <div class="metric"><span class="k">Output / 1M</span><span class="v">${m.pout!=null?`<b>$${m.pout}</b>`:'—'}</span></div>
        ${m.tps?`<div class="metric metric--end"><span class="k">Throughput</span><span class="v">${m.tps} tok/s</span></div>`:'<div style="margin-left:auto"></div>'}
      </div>
    </div>`;
  }

  const gh = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="width:16px;height:16px"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.8 18 5.1 18 5.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>';
  return { markSvg, brand, navMarketing, navApp, navAdmin, footer, MODELS, modelCard, favStar, gh };
})();
window.SCREENS = {};
