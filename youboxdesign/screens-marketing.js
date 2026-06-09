/* Marketing / public screens */
(function () {
  const code = `<span class="k-key">import</span> OpenAI <span class="k-key">from</span> <span class="k-str">"openai"</span>;

<span class="k-key">const</span> yb = <span class="k-key">new</span> <span class="k-fn">OpenAI</span>({
  baseURL: <span class="k-str">"https://api.youbox.dev/v1"</span>,
  apiKey: process.env.YOUBOX_KEY,
});

<span class="k-key">const</span> res = <span class="k-key">await</span> yb.chat.completions.<span class="k-fn">create</span>({
  model: <span class="k-str">"anthropic/claude-opus-4.6"</span>,
  messages: [{ role: <span class="k-str">"user"</span>, content: <span class="k-str">"Hello!"</span> }],
});`;

  const codeBlock = (name, body) => `<div class="code">
    <div class="code__bar"><span class="code__dots"><i></i><i></i><i></i></span><span class="code__name">${name}</span><span class="code__copy"><i data-lucide="copy"></i></span></div>
    <pre>${body}</pre></div>`;

  const ticker = () => `<div style="display:flex;gap:40px;margin-top:46px;padding-top:26px;border-top:1px solid var(--divider)">
    ${[['Models','312',''],['Providers','34',''],['Tokens routed','1.4','T / day'],['Uptime','99.98','%']].map(([l,v,u])=>
      `<div><div style="font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted)">${l}</div>
       <div style="font-family:var(--font-display);font-weight:600;font-size:26px;letter-spacing:-0.02em;color:var(--text-strong);line-height:1;margin-top:6px;display:flex;align-items:baseline;gap:5px">${v}${u?`<span style="font-family:var(--font-mono);font-size:13px;font-weight:400;color:var(--text-muted)">${u}</span>`:''}</div></div>`).join('')}
  </div>`;

  const providers = () => `<section style="padding:48px 0;border-top:1px solid var(--divider)"><div class="yb-wrap" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center">
    <span style="font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-right:6px">Route to</span>
    ${['Anthropic','OpenAI','Google','Meta','Mistral','DeepSeek','Cohere','Alibaba'].map(p=>`<span class="chip"><span style="width:7px;height:7px;border-radius:50%;background:var(--accent)"></span>${p}</span>`).join('')}
    <span class="chip" style="color:var(--text-muted)">+26 more</span></div></section>`;

  // ---- Hero variations -------------------------------------------------
  // A — split: headline + code (the canonical)
  const heroA = () => `<section style="position:relative;overflow:hidden;padding:84px 0 0">
    <div class="glow" style="top:-160px;right:-120px;width:520px;height:520px"></div>
    <div class="yb-wrap" style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:54px;align-items:center">
      <div>
        <p class="eyebrow" style="margin-bottom:14px">// One API · 300+ models</p>
        <h1 style="font-family:var(--font-display);font-size:62px;line-height:1.02;letter-spacing:-0.035em;font-weight:700;margin:0 0 22px;color:var(--text-strong)">Every model,<br><span style="color:var(--brand)">one box.</span></h1>
        <p style="font-size:19px;line-height:1.55;color:var(--text-secondary);max-width:30em;margin:0 0 30px">YouBox 是通向所有前沿大模型的统一网关。Write one integration and route to any provider — with automatic failover, smart cost routing, and pass-through pricing.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><a class="btn btn--primary btn--lg">Get your API key <i data-lucide="arrow-right"></i></a><a class="btn btn--secondary btn--lg"><i data-lucide="book-open"></i> Read the docs</a></div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:22px;font-size:13px;color:var(--text-muted)"><i data-lucide="check-circle-2" style="width:15px;height:15px;color:var(--success)"></i> No markup on tokens · Drop-in OpenAI-compatible SDK</div>
        ${ticker()}
      </div>
      <div>${codeBlock('route.ts', code)}</div>
    </div></section>`;

  // B — centered, big statement + search bar + model row
  const heroB = () => `<section style="position:relative;overflow:hidden;padding:96px 0 0;text-align:center">
    <div class="glow" style="top:-200px;left:50%;transform:translateX(-50%);width:680px;height:520px"></div>
    <div class="yb-wrap" style="max-width:860px">
      <p class="eyebrow" style="margin-bottom:18px">// 312 models · 34 providers · one endpoint</p>
      <h1 style="font-family:var(--font-display);font-size:70px;line-height:1.0;letter-spacing:-0.038em;font-weight:700;margin:0 0 22px;color:var(--text-strong)">Route to <span style="color:var(--brand)">any LLM.</span><br>Pay for tokens.</h1>
      <p style="font-size:20px;line-height:1.55;color:var(--text-secondary);max-width:34em;margin:0 auto 32px">One OpenAI-compatible API for every frontier model. Smart cost routing, automatic failover, real-time pricing — 没有加价。</p>
      <div style="max-width:560px;margin:0 auto;display:flex;gap:10px">
        <div class="input input--focus" style="flex:1;height:52px;font-size:16px"><i data-lucide="search" style="width:18px;height:18px"></i><span class="ph">Search 312 models — Claude, GPT, Gemini, Llama…</span></div>
        <a class="btn btn--primary btn--lg" style="height:52px">Browse models</a>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">${['Claude Opus 4.6','GPT-5.2','Gemini 3 Pro','DeepSeek V4','Qwen 3 Max'].map(t=>`<span class="chip">${t}</span>`).join('')}</div>
      ${ticker().replace('margin-top:46px','margin-top:54px;max-width:640px;margin-left:auto;margin-right:auto;justify-content:center')}
    </div></section>`;

  // C — split: headline + live marketplace preview card
  const heroC = () => `<section style="position:relative;overflow:hidden;padding:80px 0 0">
    <div class="glow" style="top:-160px;right:-80px;width:560px;height:520px"></div>
    <div class="yb-wrap" style="display:grid;grid-template-columns:1fr 1fr;gap:54px;align-items:center">
      <div>
        <p class="eyebrow" style="margin-bottom:14px">// The model marketplace</p>
        <h1 style="font-family:var(--font-display);font-size:58px;line-height:1.04;letter-spacing:-0.034em;font-weight:700;margin:0 0 22px;color:var(--text-strong)">One catalog.<br>Every model,<br><span style="color:var(--brand)">side by side.</span></h1>
        <p style="font-size:18px;line-height:1.55;color:var(--text-secondary);max-width:28em;margin:0 0 30px">Compare price, context, and throughput across 312 models. Switch providers with a single string — failover is automatic.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--primary btn--lg">Explore the catalog <i data-lucide="arrow-right"></i></a><a class="btn btn--ghost btn--lg"><i data-lucide="bar-chart-3"></i> View rankings</a></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        ${YB.modelCard(YB.MODELS[0], true)}
        ${YB.modelCard(YB.MODELS[5], false)}
      </div>
    </div></section>`;

  const heroFrame = (h, label) => `<div class="yb-screen">${YB.navMarketing('models')}${h}<div style="height:48px"></div></div>`;

  SCREENS.heroA = heroFrame(heroA());
  SCREENS.heroB = heroFrame(heroB());
  SCREENS.heroC = heroFrame(heroC());

  // ---- Full landing (variation A + sections) ---------------------------
  const features = () => {
    const items = [
      ['zap','Smart routing','Route by cost, latency, or quality. YouBox picks the cheapest provider that meets your SLA on every request.'],
      ['shield-check','Automatic failover','If a provider degrades or rate-limits, we retry the next best model in milliseconds — your app never sees it.'],
      ['receipt','Pass-through pricing','Pay provider rates with no gateway markup. One invoice, usage broken down by key, model, and team.'],
      ['plug','Drop-in compatible','Point the OpenAI SDK at our base URL. No rewrites — chat, embeddings, vision, tools, streaming all work.'],
      ['gauge','Live observability','Latency, throughput, spend, and error rates per model — streamed to your dashboard in real time.'],
      ['key','Keys & limits','Issue scoped keys with per-key budgets, rate limits, and model allowlists. Rotate without downtime.'],
    ];
    return `<section style="padding:96px 0"><div class="yb-wrap">
      <div style="max-width:620px;margin-bottom:40px"><p class="eyebrow" style="margin-bottom:14px">// Why YouBox</p>
      <h2 style="font-family:var(--font-display);font-size:38px;letter-spacing:-0.025em;line-height:1.08;margin:0 0 14px;font-weight:700;color:var(--text-strong)">Infrastructure for multi-model apps.</h2>
      <p style="font-size:17px;color:var(--text-secondary);line-height:1.55;margin:0">Everything you need to ship on top of every provider at once — without becoming a routing company.</p></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${items.map(([ic,t,d])=>`<div style="display:flex;flex-direction:column;gap:12px;padding:26px;background:var(--surface-card);border:1px solid var(--border);border-radius:var(--radius-lg)">
          <div style="width:42px;height:42px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;background:var(--brand-subtle);color:var(--brand)"><i data-lucide="${ic}" style="width:21px;height:21px"></i></div>
          <h3 style="font-size:18px;margin:0;letter-spacing:-0.01em;color:var(--text-strong)">${t}</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.55;margin:0">${d}</p></div>`).join('')}
      </div></div></section>`;
  };

  const howItWorks = () => {
    const steps = [['Get your key','Sign up and create an API key from the dashboard in seconds.'],['Point your SDK','Change the base URL to api.youbox.dev — keep using the OpenAI SDK.'],['Pick a model','Pass any provider-prefixed model slug. Routing & failover are automatic.']];
    return `<section style="padding:96px 0;border-top:1px solid var(--divider)"><div class="yb-wrap" style="display:grid;grid-template-columns:0.9fr 1.1fr;gap:48px;align-items:center">
      <div><p class="eyebrow" style="margin-bottom:14px">// Quickstart</p>
        <h2 style="font-family:var(--font-display);font-size:36px;letter-spacing:-0.025em;line-height:1.08;margin:0 0 8px;font-weight:700;color:var(--text-strong)">Live in three steps.</h2>
        <div style="display:flex;flex-direction:column;gap:22px;margin-top:28px">
        ${steps.map(([t,d],i)=>`<div style="display:flex;gap:14px"><span style="flex:none;width:28px;height:28px;border-radius:50%;background:var(--brand-subtle);color:var(--brand);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:600">${i+1}</span><div><p style="font-weight:600;font-size:15px;margin:0 0 3px;color:var(--text)">${t}</p><p style="font-size:14px;color:var(--text-secondary);margin:0;line-height:1.5">${d}</p></div></div>`).join('')}
        </div></div>
      <div>${codeBlock('quickstart.sh', `<span class="k-com"># 1 · export your key</span>
<span class="k-key">export</span> YOUBOX_KEY=<span class="k-str">"yb-live-••••••••••••"</span>

<span class="k-com"># 2 · call any model, OpenAI-compatible</span>
curl https://api.youbox.dev/v1/chat/completions \\
  -H <span class="k-str">"Authorization: Bearer \$YOUBOX_KEY"</span> \\
  -d <span class="k-str">'{ "model": "anthropic/claude-opus-4.6",
        "messages": [{"role":"user","content":"hi"}] }'</span>`)}</div>
    </div></section>`;
  };

  const cta = () => `<section style="padding:40px 0 96px"><div class="yb-wrap">
    <div style="position:relative;overflow:hidden;border:1px solid var(--brand-border);border-radius:var(--radius-2xl);padding:56px;text-align:center;background:var(--surface-card);box-shadow:var(--glow-soft)">
      <div class="glow" style="top:-120px;left:50%;transform:translateX(-50%);width:480px;height:360px"></div>
      <h2 style="font-family:var(--font-display);font-size:40px;letter-spacing:-0.03em;margin:0 0 14px;font-weight:700;color:var(--text-strong)">Start routing in minutes.</h2>
      <p style="font-size:18px;color:var(--text-secondary);max-width:32em;margin:0 auto 28px">Free $5 of credits. No credit card. Cancel any time — you only pay for tokens you use.</p>
      <div style="display:flex;gap:12px;justify-content:center"><a class="btn btn--primary btn--lg">Create free account <i data-lucide="arrow-right"></i></a><a class="btn btn--secondary btn--lg">Talk to sales</a></div>
    </div></div></section>`;

  SCREENS.landing = `<div class="yb-screen">${YB.navMarketing('models')}${heroA()}${providers()}${features()}${howItWorks()}${cta()}${YB.footer()}</div>`;

  // ---- Marketplace / catalog ------------------------------------------
  SCREENS.marketplace = `<div class="yb-screen">${YB.navMarketing('models')}
    <div class="yb-wrap page">
      <div class="page__head"><div><p class="eyebrow" style="margin-bottom:10px">// Marketplace</p><h1 class="page__title">Models</h1><p class="page__sub">312 models from 34 providers. Compare price, context and throughput — switch with one string.</p></div></div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap">
        <div class="input" style="flex:1;max-width:380px"><i data-lucide="search"></i><span class="ph">Search 312 models…</span></div>
        <div class="tabs">${[['All',312],['Chat',214],['Image',38],['Audio',29],['Embeddings',18]].map(([l,c],i)=>`<span class="tabs__t ${i===0?'tabs__t--active':''}">${l}<span class="cnt">${c}</span></span>`).join('')}</div>
        <div style="flex:1"></div>
        <span class="tag"><i data-lucide="arrow-down-up"></i> sort: trending</span>
      </div>
      <div class="mgrid" style="grid-template-columns:repeat(3,1fr)">
        ${YB.MODELS.map((m,i)=>YB.modelCard(m, i===0)).join('')}
      </div>
      <div style="display:flex;justify-content:center;margin-top:32px"><a class="btn btn--secondary">Load more models</a></div>
    </div>${YB.footer()}</div>`;

  // ---- Model detail ----------------------------------------------------
  const m = YB.MODELS[0];
  const providerRow = (name, logo, tps, lat, up, price, sel) => `<tr ${sel?'style="background:var(--brand-subtle)"':''}>
    <td><div class="cellflex"><span class="avatar-sm">${logo}</span><div><div class="strong" style="font-weight:600">${name}</div><div class="sub mono">anthropic/claude-opus-4.6</div></div></div></td>
    <td class="mono">${tps} tok/s</td><td class="mono">${lat}s</td>
    <td><span class="badge badge--success"><span class="bd"></span>${up}%</span></td>
    <td class="r mono"><b style="color:var(--brand)">$${price}</b></td>
    <td class="r">${sel?'<span class="badge badge--brand">active</span>':'<span class="iconbtn"><i data-lucide="chevron-right"></i></span>'}</td></tr>`;

  SCREENS.modelDetail = `<div class="yb-screen">${YB.navMarketing('models')}
    <div class="yb-wrap page">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);margin-bottom:22px"><span>Models</span><i data-lucide="chevron-right" style="width:14px;height:14px"></i><span>Anthropic</span><i data-lucide="chevron-right" style="width:14px;height:14px"></i><span class="strong">Claude Opus 4.6</span></div>
      <div style="display:grid;grid-template-columns:1fr 360px;gap:32px;align-items:start">
        <div>
          <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:24px">
            <div class="mcard__logo" style="width:52px;height:52px;font-size:18px">AN</div>
            <div style="flex:1"><div style="display:flex;align-items:center;gap:10px"><h1 class="page__title" style="font-size:30px">Claude Opus 4.6</h1><span class="badge badge--brand">New</span></div>
            <div class="mono" style="font-size:13px;color:var(--text-muted);margin-top:6px">anthropic/claude-opus-4.6 · by Anthropic</div></div>
            <a class="btn btn--subtle btn--sm"><i data-lucide="star"></i> Favorite</a>
            <a class="btn btn--primary btn--sm"><i data-lucide="play"></i> Open in Playground</a>
          </div>
          <p style="font-size:16px;color:var(--text-secondary);line-height:1.6;max-width:62ch;margin-bottom:8px">Frontier reasoning model with state-of-the-art coding and long-horizon agentic performance. Supports vision, tool use, and a 200K-token context window — routed across 4 upstream providers for resilience.</p>
          <div class="mcard__tags" style="margin:18px 0 28px">${['vision','tools','200K ctx','streaming','json mode','中文'].map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          <div class="tabs tabs--line" style="margin-bottom:0"><span class="tabs__t tabs__t--active">Providers</span><span class="tabs__t">Pricing</span><span class="tabs__t">Performance</span><span class="tabs__t">Apps</span></div>
          <div class="panel" style="border-top-left-radius:0;border-top-right-radius:0;border-top:none">
            <table class="table"><thead><tr><th>Provider</th><th>Throughput</th><th>Latency</th><th>Uptime</th><th class="r">Out / 1M</th><th></th></tr></thead>
            <tbody>${providerRow('YouBox Auto','YB',118,0.42,99.98,15.0,true)+providerRow('Anthropic','AN',112,0.45,99.97,15.0)+providerRow('AWS Bedrock','AW',104,0.51,99.92,15.6)+providerRow('Google Vertex','GV',96,0.58,99.89,15.6)}</tbody></table>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><div class="panel__body" style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
            ${[['Input / 1M','$3.00'],['Output / 1M','$15.00'],['Context','200K'],['Max output','64K'],['Throughput','118 tok/s'],['Latency','0.42 s']].map(([k,v])=>`<div><div style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted)">${k}</div><div style="font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--text-strong);margin-top:4px;letter-spacing:-0.02em">${v}</div></div>`).join('')}
          </div></div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:15px">Weekly usage</span></div><div class="panel__body">${SPARK()}</div></div>
          <div class="panel"><div class="panel__body"><div class="yb-eyebrow" style="margin-bottom:10px">// quick call</div>${codeBlock('call.ts',`model: <span class="k-str">"anthropic/claude-opus-4.6"</span>`)}</div></div>
        </div>
      </div>
    </div>${YB.footer()}</div>`;

  function SPARK(){
    const pts=[8,14,11,20,16,26,22,30,27,38,34,44];
    const max=48,w=300,h=90;
    const path=pts.map((v,i)=>`${(i/(pts.length-1))*w},${h-(v/max)*h}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="90" preserveAspectRatio="none">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity="0.28"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>
      <polygon points="0,${h} ${path} ${w},${h}" fill="url(#sg)"/>
      <polyline points="${path}" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  window.SPARK = SPARK;

  // ---- Rankings --------------------------------------------------------
  const rankRow = (i, m, share, growth, tokens) => `<tr>
    <td style="width:54px"><span style="font-family:var(--font-display);font-weight:700;font-size:18px;color:${i<3?'var(--brand)':'var(--text-muted)'}">${String(i+1).padStart(2,'0')}</span></td>
    <td><div class="cellflex"><span class="mcard__logo" style="width:34px;height:34px;font-size:12px">${m.logo}</span><div><div class="strong" style="font-weight:600">${m.name}</div><div class="sub mono">${m.prov}</div></div></div></td>
    <td style="width:240px"><div style="display:flex;align-items:center;gap:10px"><div class="bar" style="flex:1"><i style="width:${share}%"></i></div><span class="mono secondary" style="font-size:12px;width:42px">${share}%</span></div></td>
    <td class="mono r">${tokens}</td>
    <td class="r"><span class="badge ${growth>0?'badge--success':'badge--danger'}"><i data-lucide="trending-${growth>0?'up':'down'}" style="width:12px;height:12px"></i>${growth>0?'+':''}${growth}%</span></td></tr>`;
  const rk=[ [YB.MODELS[0],100,12,'48.2B'],[YB.MODELS[1],86,8,'41.4B'],[YB.MODELS[7],71,34,'34.1B'],[YB.MODELS[2],63,5,'30.3B'],[YB.MODELS[5],52,28,'25.0B'],[YB.MODELS[3],44,-3,'21.2B'],[YB.MODELS[4],31,2,'14.9B'] ];
  SCREENS.rankings = `<div class="yb-screen">${YB.navMarketing('rankings')}
    <div class="yb-wrap page">
      <div class="page__head"><div><p class="eyebrow" style="margin-bottom:10px">// Rankings</p><h1 class="page__title">Trending models</h1><p class="page__sub">Ranked by tokens routed through YouBox this week across all apps.</p></div>
      <div class="page__actions"><div class="tabs"><span class="tabs__t tabs__t--active">This week</span><span class="tabs__t">This month</span><span class="tabs__t">All time</span></div></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
        ${[['Tokens routed','1.4','T this week','up','+12%'],['Active apps','8,420','','up','+6%'],['Models served','312','','flat','+0'],['Median latency','0.46','s','up','−4%']].map(([l,v,u,d,delta])=>`<div class="statcard"><div class="statcard__label">${l}</div><div class="statcard__val">${v}${u?`<span class="u">${u}</span>`:''}</div><div class="statcard__delta ${d}"><i data-lucide="trending-${d==='down'?'down':'up'}"></i>${delta}</div></div>`).join('')}
      </div>
      <div class="panel"><table class="table"><thead><tr><th>#</th><th>Model</th><th>Market share</th><th class="r">Tokens / wk</th><th class="r">Growth</th></tr></thead>
      <tbody>${rk.map(([m,s,g,t],i)=>rankRow(i,m,s,g,t)).join('')}</tbody></table></div>
    </div>${YB.footer()}</div>`;
})();
