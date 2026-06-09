/* Authenticated console screens */
(function () {
  // ---- chart helpers ---------------------------------------------------
  function areaChart(series, w, h) {
    // series: [{pts:[...], color}] ; draws gridlines + lines
    const max = Math.max(...series.flatMap(s => s.pts)) * 1.15;
    const n = series[0].pts.length;
    const x = i => (i / (n - 1)) * w;
    const y = v => h - (v / max) * h;
    const grid = [0.25,0.5,0.75,1].map(g=>`<line x1="0" y1="${h-g*h}" x2="${w}" y2="${h-g*h}" stroke="var(--divider)" stroke-width="1"/>`).join('');
    const layers = series.map((s,si)=>{
      const line = s.pts.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
      const gid = 'ag'+si+Math.floor(Math.random()*9999);
      return `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity="0.22"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs>
        ${s.fill!==false?`<polygon points="0,${h} ${line} ${w},${h}" fill="url(#${gid})"/>`:''}
        <polyline points="${line}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block">${grid}${layers}</svg>`;
  }
  function barChart(values, w, h, color) {
    const max = Math.max(...values)*1.1; const n=values.length; const bw=w/n*0.55; const gap=w/n;
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block">
      ${values.map((v,i)=>`<rect x="${i*gap+(gap-bw)/2}" y="${h-(v/max)*h}" width="${bw}" height="${(v/max)*h}" rx="2" fill="${color||'var(--brand)'}" opacity="${i===n-1?1:0.5}"/>`).join('')}</svg>`;
  }
  const days = ['M','T','W','T','F','S','S'];

  // ---- Dashboard -------------------------------------------------------
  const spendRows = [
    [YB.MODELS[0],38,'$94.20'],[YB.MODELS[1],27,'$66.80'],[YB.MODELS[7],16,'$39.60'],[YB.MODELS[5],11,'$27.20'],[YB.MODELS[2],8,'$20.10']
  ];
  SCREENS.dashboard = `<div class="yb-screen">${YB.navApp('dashboard')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Dashboard</h1><p class="page__sub">早上好，Jordan。Here's your activity for the last 7 days.</p></div>
        <div class="page__actions"><div class="select" style="width:150px">Last 7 days<i data-lucide="chevron-down"></i></div><a class="btn btn--secondary btn--sm"><i data-lucide="download"></i> Export</a><a class="btn btn--primary btn--sm"><i data-lucide="plus"></i> New key</a></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px">
        ${[['activity','Requests','1.28','M','up','+18%'],['coins','Spend','$247.90','','up','+12%'],['zap','Tokens','842','M','up','+9%'],['timer','Avg latency','0.46','s','down','−4%']].map(([ic,l,v,u,d,delta])=>`<div class="statcard"><div class="statcard__label"><i data-lucide="${ic}" class="ic"></i>${l}</div><div class="statcard__val">${v}${u?`<span class="u">${u}</span>`:''}</div><div class="statcard__delta ${d}"><i data-lucide="trending-${d==='down'?'down':'up'}"></i>${delta} vs last week</div></div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1.7fr 1fr;gap:16px;margin-bottom:16px">
        <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// Requests over time</div><span class="panel__title" style="font-size:16px">1.28M requests</span></div>
          <div class="tabs"><span class="tabs__t tabs__t--active">Requests</span><span class="tabs__t">Tokens</span><span class="tabs__t">Spend</span></div></div>
          <div class="panel__body">${areaChart([{pts:[42,55,48,70,62,88,76,95,84,110,102,128],color:'var(--brand)'},{pts:[20,28,24,30,34,40,36,52,44,58,55,66],color:'var(--accent)',fill:false}],700,170)}
          <div style="display:flex;justify-content:space-between;margin-top:12px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${['Jun 3','Jun 4','Jun 5','Jun 6','Jun 7','Jun 8','Jun 9'].map(d=>`<span>${d}</span>`).join('')}</div>
          <div style="display:flex;gap:20px;margin-top:14px;font-size:12px"><span style="display:flex;align-items:center;gap:7px"><span style="width:9px;height:9px;border-radius:2px;background:var(--brand)"></span>Success</span><span style="display:flex;align-items:center;gap:7px"><span style="width:9px;height:9px;border-radius:2px;background:var(--accent)"></span>Streamed</span></div></div></div>
        <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Spend by model</span><span class="badge badge--neutral">7d</span></div>
          <div class="panel__body" style="display:flex;flex-direction:column;gap:15px">
          ${spendRows.map(([m,pct,amt])=>`<div><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span class="avatar-sm">${m.logo}</span><span class="strong" style="font-weight:500;font-size:13px;flex:1">${m.name}</span><span class="mono secondary" style="font-size:13px">${amt}</span></div><div class="bar"><i style="width:${pct*2.4}%"></i></div></div>`).join('')}
          </div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Recent activity</span><a class="btn btn--ghost btn--sm">View all <i data-lucide="arrow-right"></i></a></div>
          <table class="table"><tbody>
          ${[['Claude Opus 4.6','chat.completions','200','$0.04','12s ago'],['GPT-5.2','chat.completions','200','$0.02','48s ago'],['Qwen 3 Max','chat.completions','200','$0.01','2m ago'],['DeepSeek V4','chat.completions','429','—','5m ago'],['Gemini 3 Pro','embeddings','200','$0.00','7m ago']].map(([mod,ep,st,cost,t])=>`<tr><td><div class="strong" style="font-weight:500">${mod}</div><div class="sub mono">${ep}</div></td><td><span class="badge ${st==='200'?'badge--success':'badge--warning'}"><span class="bd"></span>${st}</span></td><td class="mono r">${cost}</td><td class="mono muted r" style="font-size:12px">${t}</td></tr>`).join('')}
          </tbody></table></div>
        <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Credit balance</span><a class="btn btn--subtle btn--sm"><i data-lucide="plus"></i> Top up</a></div>
          <div class="panel__body">
            <div style="display:flex;align-items:baseline;gap:8px"><span style="font-family:var(--font-display);font-weight:700;font-size:40px;letter-spacing:-0.03em;color:var(--text-strong)">$248.10</span><span class="mono muted">/ $500 budget</span></div>
            <div class="bar" style="margin:16px 0 8px;height:8px"><i style="width:50%"></i></div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted)" class="mono"><span>Used $251.90</span><span>~21 days left at current rate</span></div>
            <hr class="divider" style="margin:20px 0">
            <div class="yb-eyebrow" style="margin-bottom:12px">// daily spend</div>
            ${barChart([18,24,21,30,27,38,34],340,80,'var(--brand)')}
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${days.map(d=>`<span>${d}</span>`).join('')}</div>
          </div></div>
      </div>
    </div></div>`;

  // ---- API Keys --------------------------------------------------------
  const keyRow = (name, key, model, spend, lim, status, last) => `<tr>
    <td><div class="strong" style="font-weight:600">${name}</div><div class="sub mono">${key}</div></td>
    <td><span class="tag">${model}</span></td>
    <td class="mono">${spend}<div class="sub">of ${lim}</div></td>
    <td><span class="badge ${status==='Active'?'badge--success':status==='Limited'?'badge--warning':'badge--neutral'}"><span class="bd"></span>${status}</span></td>
    <td class="mono muted">${last}</td>
    <td class="r"><span class="rowact"><span class="iconbtn"><i data-lucide="copy"></i></span><span class="iconbtn"><i data-lucide="pencil"></i></span><span class="iconbtn"><i data-lucide="trash-2"></i></span></span></td></tr>`;
  SCREENS.keys = `<div class="yb-screen">${YB.navApp('keys')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">API Keys</h1><p class="page__sub">Issue scoped keys with per-key budgets, rate limits and model allowlists.</p></div>
        <div class="page__actions"><a class="btn btn--secondary btn--sm"><i data-lucide="book-open"></i> Docs</a><a class="btn btn--primary"><i data-lucide="plus"></i> Create API key</a></div></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
        ${[['Active keys','6'],['Monthly spend','$247.90'],['Requests today','38,204']].map(([l,v])=>`<div class="statcard"><div class="statcard__label">${l}</div><div class="statcard__val">${v}</div></div>`).join('')}
      </div>
      <div class="panel" style="margin-bottom:16px;border-color:var(--brand-border);background:var(--brand-subtle)">
        <div class="panel__body" style="display:flex;align-items:center;gap:14px">
          <i data-lucide="check-circle-2" style="color:var(--success);width:20px;height:20px"></i>
          <div style="flex:1"><div class="strong" style="font-weight:600">New key created — copy it now</div><div class="muted" style="font-size:13px">For security, the full secret is shown only once.</div></div>
          <div class="input input--mono" style="width:320px;background:var(--code-bg)"><span style="color:var(--text)">yb-live-9f2a••••••••••••••••3c71</span><i data-lucide="copy" style="margin-left:auto"></i></div>
          <a class="btn btn--primary btn--sm">Copy</a>
        </div></div>
      <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Your keys</span>
        <div style="display:flex;gap:10px"><div class="input" style="width:200px;height:36px"><i data-lucide="search"></i><span class="ph">Filter keys</span></div></div></div>
        <table class="table"><thead><tr><th>Name</th><th>Models</th><th>Spend</th><th>Status</th><th>Last used</th><th></th></tr></thead>
        <tbody>${[
          ['Production','yb-live-••••3c71','all models','$182.40','$300','Active','3m ago'],
          ['Mobile app','yb-live-••••a0f9','chat only','$41.20','$100','Active','1h ago'],
          ['Data pipeline','yb-live-••••7be2','embeddings','$18.90','$50','Active','2h ago'],
          ['Staging','yb-test-••••11d4','all models','$5.40','$25','Limited','1d ago'],
          ['Old CI key','yb-live-••••8a3c','all models','$0.00','$50','Revoked','14d ago'],
        ].map(r=>keyRow(...r)).join('')}</tbody></table></div>
    </div></div>`;

  // ---- Playground ------------------------------------------------------
  const msg = (role, who, text, mono) => `<div style="display:flex;gap:13px;padding:18px 0;border-bottom:1px solid var(--divider)">
    <span class="avatar-sm" style="background:${role==='user'?'var(--surface-3)':'var(--brand-subtle)'};color:${role==='user'?'var(--text-strong)':'var(--brand)'}">${who}</span>
    <div style="flex:1"><div style="font-weight:600;font-size:13px;color:var(--text-strong);margin-bottom:6px">${role==='user'?'You':'Claude Opus 4.6'}</div>
    <div style="font-size:14px;line-height:1.62;color:var(--text-secondary)${mono?';font-family:var(--font-mono);font-size:13px':''}">${text}</div></div></div>`;
  SCREENS.playground = `<div class="yb-screen">${YB.navApp('playground')}
    <div style="display:grid;grid-template-columns:1fr 320px;height:760px">
      <div style="display:flex;flex-direction:column;border-right:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:12px;padding:14px 24px;border-bottom:1px solid var(--border)">
          <div class="select" style="width:260px"><span style="display:flex;align-items:center;gap:9px"><span class="avatar-sm">AN</span>anthropic/claude-opus-4.6</span><i data-lucide="chevron-down"></i></div>
          <span class="tag"><i data-lucide="zap"></i> 118 tok/s</span><span class="tag">$3 / $15 per 1M</span>
          <div style="flex:1"></div><span class="iconbtn"><i data-lucide="rotate-ccw"></i></span><span class="iconbtn"><i data-lucide="share-2"></i></span></div>
        <div style="flex:1;overflow:hidden;padding:6px 24px">
          ${msg('user','JD','给我写一个 TypeScript 函数，用指数退避重试一个 promise。')}
          ${msg('assistant','✦','Here\'s a typed <span class="mono" style="color:var(--text)">retry</span> helper with exponential backoff and jitter — it resolves on the first success and rethrows after the final attempt:')}
          ${msg('assistant','✦','<span style="color:var(--orange-300)">export async function</span> <span style="color:var(--blue-500)">retry</span>&lt;T&gt;(fn, opts) { … <span style="color:var(--text-faint)">// streaming…</span><span style="display:inline-block;width:8px;height:15px;background:var(--brand);margin-left:2px;vertical-align:-2px"></span>',true)}
        </div>
        <div style="padding:16px 24px;border-top:1px solid var(--border)">
          <div class="input" style="height:auto;padding:12px 14px;align-items:flex-start"><span class="ph" style="flex:1">Send a message…  (⌘↵ to send)</span><a class="btn btn--primary btn--sm"><i data-lucide="arrow-up"></i></a></div>
        </div>
      </div>
      <div style="padding:20px;overflow:hidden;background:var(--surface)">
        <div class="yb-eyebrow" style="margin-bottom:16px">// parameters</div>
        ${[['Temperature','0.7'],['Max tokens','4096'],['Top P','1.0'],['Frequency penalty','0.0']].map(([l,v])=>`<div style="margin-bottom:18px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px"><span class="secondary">${l}</span><span class="mono strong">${v}</span></div><div class="bar"><i style="width:${l==='Temperature'?'45':l==='Max tokens'?'40':l==='Top P'?'100':'8'}%"></i></div></div>`).join('')}
        <hr class="divider" style="margin:20px 0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><span style="font-size:13px" class="secondary">Stream response</span><span class="switch switch--on"></span></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><span style="font-size:13px" class="secondary">JSON mode</span><span class="switch"></span></div>
        <div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:13px" class="secondary">Automatic failover</span><span class="switch switch--on"></span></div>
        <hr class="divider" style="margin:20px 0">
        <div class="yb-eyebrow" style="margin-bottom:10px">// this session</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px" class="mono"><span class="muted">Tokens</span><span class="strong">3,204</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px" class="mono"><span class="muted">Cost</span><span class="strong">$0.038</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px" class="mono"><span class="muted">Latency</span><span class="strong">0.41s</span></div>
      </div>
    </div></div>`;

  // ---- Usage logs / Activity ------------------------------------------
  const logRow = (t, mod, logo, ep, tok, cost, lat, st) => `<tr>
    <td class="mono muted" style="font-size:12px">${t}</td>
    <td><div class="cellflex"><span class="avatar-sm">${logo}</span><span class="strong" style="font-weight:500">${mod}</span></div></td>
    <td><span class="tag">${ep}</span></td>
    <td class="mono r">${tok}</td><td class="mono r">${cost}</td><td class="mono r">${lat}</td>
    <td class="r"><span class="badge ${st==='200'?'badge--success':st==='429'?'badge--warning':'badge--danger'}"><span class="bd"></span>${st}</span></td></tr>`;
  SCREENS.usageLogs = `<div class="yb-screen">${YB.navApp('activity')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Activity</h1><p class="page__sub">Every request routed through your keys, with token counts, cost and latency.</p></div>
        <div class="page__actions"><a class="btn btn--secondary btn--sm"><i data-lucide="sliders-horizontal"></i> Filters</a><a class="btn btn--secondary btn--sm"><i data-lucide="download"></i> Export CSV</a></div></div>
      <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
        <div class="input" style="flex:1;max-width:300px"><i data-lucide="search"></i><span class="ph">Search by model, key, request id…</span></div>
        <div class="select" style="width:150px">All models<i data-lucide="chevron-down"></i></div>
        <div class="select" style="width:140px">All status<i data-lucide="chevron-down"></i></div>
        <div class="select" style="width:150px">Last 24 hours<i data-lucide="chevron-down"></i></div>
      </div>
      <div class="panel"><table class="table"><thead><tr><th>Time</th><th>Model</th><th>Endpoint</th><th class="r">Tokens</th><th class="r">Cost</th><th class="r">Latency</th><th class="r">Status</th></tr></thead>
      <tbody>${[
        ['14:32:08','Claude Opus 4.6','AN','chat','3,204','$0.041','0.42s','200'],
        ['14:31:55','GPT-5.2','OA','chat','1,842','$0.018','0.36s','200'],
        ['14:31:40','Qwen 3 Max','QW','chat','2,210','$0.012','0.39s','200'],
        ['14:31:12','DeepSeek V4','DS','chat','5,120','—','—','429'],
        ['14:30:58','Gemini 3 Pro','GO','embeddings','812','$0.001','0.20s','200'],
        ['14:30:31','Llama 4 405B','ME','chat','3,980','$0.004','0.55s','200'],
        ['14:30:04','Claude Opus 4.6','AN','chat','1,204','$0.018','0.44s','200'],
        ['14:29:47','Mistral Large 3','MI','chat','2,640','$0.022','0.48s','500'],
        ['14:29:20','GPT-5.2','OA','chat','920','$0.009','0.33s','200'],
      ].map(r=>logRow(...r)).join('')}</tbody></table>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--divider)"><span class="muted" style="font-size:13px">Showing 9 of 38,204 requests</span><div style="display:flex;gap:8px"><span class="btn btn--ghost btn--sm">Prev</span><span class="btn btn--secondary btn--sm">Next</span></div></div></div>
    </div></div>`;

  // ---- Credits / Wallet / top-up --------------------------------------
  SCREENS.credits = `<div class="yb-screen">${YB.navApp('dashboard')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Credits</h1><p class="page__sub">充值、查看消费明细，并管理你的预算上限。</p></div></div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:16px;align-items:start">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><div class="panel__body" style="display:flex;align-items:center;gap:28px">
            <div><div class="yb-eyebrow" style="margin-bottom:8px">// balance</div><div style="font-family:var(--font-display);font-weight:700;font-size:46px;letter-spacing:-0.03em;color:var(--text-strong);line-height:1">$248.10</div><div class="muted mono" style="font-size:13px;margin-top:8px">≈ 82M tokens at blended rate</div></div>
            <div style="flex:1"></div>
            <div style="text-align:right"><div class="statcard__delta up" style="justify-content:flex-end"><i data-lucide="trending-up"></i> healthy</div><div class="muted" style="font-size:12px;margin-top:4px">~21 days at current rate</div></div>
          </div></div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Add credits</span><span class="badge badge--brand">No markup</span></div>
            <div class="panel__body">
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">${['$10','$25','$50','$100'].map((a,i)=>`<div class="chip ${i===2?'chip--active':''}" style="height:54px;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:20px">${a}</div>`).join('')}</div>
              <div style="display:flex;gap:10px;margin-bottom:18px"><div class="input" style="flex:1"><span style="color:var(--text-muted)">$</span><span class="strong">50.00</span></div><div class="select" style="width:130px">USD<i data-lucide="chevron-down"></i></div></div>
              <div class="yb-eyebrow" style="margin-bottom:10px">// pay with</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">${[['credit-card','Card'],['wallet','支付宝 / 微信'],['bitcoin','Crypto']].map(([ic,l],i)=>`<div class="chip ${i===0?'chip--active':''}" style="height:44px;justify-content:center"><i data-lucide="${ic}"></i>${l}</div>`).join('')}</div>
              <a class="btn btn--primary btn--block btn--lg">Add $50.00 <i data-lucide="arrow-right"></i></a>
            </div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Auto top-up</span><span class="switch switch--on"></span></div><div class="panel__body"><p class="secondary" style="font-size:13px;line-height:1.55;margin-bottom:14px">When balance drops below <span class="strong mono">$25</span>, automatically add <span class="strong mono">$50</span>.</p><div style="display:flex;gap:10px"><div class="input" style="flex:1;height:36px"><span class="muted">≤ $25</span></div><div class="input" style="flex:1;height:36px"><span class="muted">+ $50</span></div></div></div></div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Transactions</span></div>
            <table class="table"><tbody>${[
              ['Top-up · Visa ••42','Jun 6','+$100.00','up'],['Usage · 7 days','Jun 1–7','−$54.20','down'],['Top-up · 支付宝','May 28','+$50.00','up'],['Usage · 7 days','May 24–31','−$48.90','down'],['Promo credit','May 20','+$5.00','up'],
            ].map(([t,d,a,dir])=>`<tr><td><div class="strong" style="font-weight:500">${t}</div><div class="sub mono">${d}</div></td><td class="mono r ${dir==='up'?'up':'secondary'}">${a}</td></tr>`).join('')}</tbody></table></div>
        </div>
      </div>
    </div></div>`;
})();
