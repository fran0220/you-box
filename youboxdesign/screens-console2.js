/* Console — part 2: chat, subscriptions, redemption, performance, notifications */
(function () {
  // ---- Chat (assistant UI) --------------------------------------------
  const convo = (t, sub, active) => `<div class="nav__link ${active?'nav__link--active':''}" style="flex-direction:column;align-items:flex-start;gap:2px;padding:11px 12px;width:100%;border-radius:var(--radius-md)">
    <span class="strong" style="font-weight:${active?600:500};font-size:13px;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</span>
    <span class="muted" style="font-size:11px;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub}</span></div>`;
  const cmsg = (role, body) => `<div style="display:flex;gap:14px;padding:20px 0">
    <span class="avatar-sm" style="background:${role==='user'?'var(--surface-3)':'var(--brand-subtle)'};color:${role==='user'?'var(--text-strong)':'var(--brand)'};width:30px;height:30px">${role==='user'?'JD':'✦'}</span>
    <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;color:var(--text-strong);margin-bottom:7px">${role==='user'?'You':'YouBox Assistant'}</div>
    <div style="font-size:15px;line-height:1.65;color:var(--text-secondary)">${body}</div></div></div>`;
  SCREENS.chat = `<div class="yb-screen">${YB.navApp('playground')}
    <div style="display:grid;grid-template-columns:260px 1fr;height:760px">
      <div style="border-right:1px solid var(--border);display:flex;flex-direction:column;background:var(--surface)">
        <div style="padding:14px"><a class="btn btn--primary btn--block btn--sm"><i data-lucide="plus"></i> New chat</a></div>
        <div style="padding:0 10px 8px"><div class="input" style="height:34px"><i data-lucide="search"></i><span class="ph">Search chats</span></div></div>
        <div style="flex:1;overflow:hidden;padding:6px 10px"><div class="yb-eyebrow" style="padding:6px 4px">// today</div>
          ${convo('Retry helper with backoff','Claude Opus 4.6 · 2m',true)}${convo('Summarize Q2 board deck','GPT-5.2 · 1h')}${convo('SQL for cohort retention','DeepSeek V4 · 3h')}
          <div class="yb-eyebrow" style="padding:12px 4px 6px">// yesterday</div>
          ${convo('翻译产品发布说明','Qwen 3 Max')}${convo('Regex for E.164 phones','Gemini 3 Pro')}${convo('Rewrite landing hero copy','Mistral Large 3')}
        </div>
        <div style="padding:12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px"><span class="avatar-sm">JD</span><div style="flex:1"><div class="strong" style="font-size:13px;font-weight:500">Jordan Diaz</div><div class="muted mono" style="font-size:11px">$248.10</div></div><span class="iconbtn"><i data-lucide="settings"></i></span></div>
      </div>
      <div style="display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;gap:12px;padding:14px 28px;border-bottom:1px solid var(--border)"><span class="strong" style="font-weight:600;font-size:15px">Retry helper with backoff</span><span class="tag"><span class="avatar-sm" style="width:18px;height:18px;font-size:9px">AN</span>claude-opus-4.6</span><div style="flex:1"></div><span class="iconbtn"><i data-lucide="share-2"></i></span><span class="iconbtn"><i data-lucide="more-horizontal"></i></span></div>
        <div style="flex:1;overflow:hidden;padding:8px 28px;max-width:820px;margin:0 auto;width:100%">
          ${cmsg('user','给我写一个 TypeScript 函数，用指数退避重试一个 promise，带 jitter。')}
          ${cmsg('assistant','Here\'s a typed <span class="mono strong">retry</span> helper. It retries on rejection with exponential backoff plus full jitter, resolves on the first success, and rethrows after the final attempt:')}
          ${cmsg('assistant','<div class="code" style="margin:2px 0"><div class="code__bar"><span class="code__dots"><i></i><i></i><i></i></span><span class="code__name">retry.ts</span></div><pre style="font-size:12px"><span class="k-key">export async function</span> <span class="k-fn">retry</span>&lt;T&gt;(\n  fn: () =&gt; <span class="k-fn">Promise</span>&lt;T&gt;, { tries = <span class="k-num">5</span>, base = <span class="k-num">200</span> } = {}\n) { <span class="k-com">// … full jitter</span> }</pre></div><span style="display:inline-block;width:8px;height:16px;background:var(--brand);margin-top:6px"></span>')}
        </div>
        <div style="padding:16px 28px;max-width:820px;margin:0 auto;width:100%">
          <div class="input" style="height:auto;padding:14px 16px;align-items:center;border-radius:var(--radius-lg)"><span class="ph" style="flex:1">Message YouBox Assistant…</span><span class="iconbtn"><i data-lucide="paperclip"></i></span><a class="btn btn--primary btn--sm" style="width:34px;padding:0"><i data-lucide="arrow-up"></i></a></div>
          <p class="muted" style="font-size:11px;text-align:center;margin-top:10px">YouBox routes to the best provider for this model. Responses may be inaccurate.</p>
        </div>
      </div>
    </div></div>`;

  // ---- Subscriptions ---------------------------------------------------
  SCREENS.subscriptions = `<div class="yb-screen">${YB.navApp('dashboard')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Subscription</h1><p class="page__sub">管理你的订阅计划与发票。Manage your plan, limits and invoices.</p></div></div>
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;align-items:start">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel" style="border-color:var(--brand-border)"><div class="panel__body" style="display:flex;align-items:center;gap:24px">
            <div style="flex:1"><div style="display:flex;align-items:center;gap:10px"><span class="badge badge--brand">Pro</span><span class="badge badge--success"><span class="bd"></span>Active</span></div>
              <div style="font-family:var(--font-display);font-weight:700;font-size:34px;letter-spacing:-0.025em;color:var(--text-strong);margin-top:12px">$20<span class="mono muted" style="font-size:15px;font-weight:400">/ month</span></div>
              <div class="muted" style="font-size:13px;margin-top:6px">Renews June 28, 2026 · Visa ending 42</div></div>
            <div style="display:flex;flex-direction:column;gap:8px"><a class="btn btn--secondary btn--sm">Change plan</a><a class="btn btn--ghost btn--sm">Cancel</a></div>
          </div></div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">This period's usage</span><span class="badge badge--neutral">Jun 1 – Jun 28</span></div>
            <div class="panel__body" style="display:flex;flex-direction:column;gap:18px">
              ${[['Requests','1.28M','of 5M included',26],['Rate limit','100','req / sec',100],['Seats','3','of 5',60]].map(([l,v,sub,pct])=>`<div><div style="display:flex;justify-content:space-between;margin-bottom:7px"><span class="strong" style="font-size:13px;font-weight:500">${l}</span><span class="mono secondary" style="font-size:13px">${v} <span class="muted">${sub}</span></span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`).join('')}
            </div></div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Invoices</span><a class="btn btn--ghost btn--sm">Download all</a></div>
            <table class="table"><tbody>${[['Jun 2026','$74.20','Paid'],['May 2026','$68.90','Paid'],['Apr 2026','$54.10','Paid'],['Mar 2026','$41.80','Paid']].map(([d,a,s])=>`<tr><td><div class="strong" style="font-weight:500">${d}</div><div class="sub mono">Pro + usage</div></td><td class="mono">${a}</td><td><span class="badge badge--success"><span class="bd"></span>${s}</span></td><td class="r"><span class="iconbtn"><i data-lucide="download"></i></span></td></tr>`).join('')}</tbody></table></div>
        </div>
        <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Available plans</span></div>
          <div class="panel__body" style="display:flex;flex-direction:column;gap:12px">
            ${[['Free','$0','Pass-through pricing',false],['Pro','$20 / mo','Current plan',true],['Scale','Usage','Priority lanes & SSO',false],['Enterprise','Custom','Dedicated capacity',false]].map(([n,p,d,cur])=>`<div style="display:flex;align-items:center;gap:12px;padding:14px;border:1px solid ${cur?'var(--brand-border)':'var(--border)'};border-radius:var(--radius-md);background:${cur?'var(--brand-subtle)':'transparent'}"><div style="flex:1"><div class="strong" style="font-weight:600;font-size:14px">${n}</div><div class="muted" style="font-size:12px">${d}</div></div><div class="mono strong" style="font-size:13px">${p}</div>${cur?'<span class="badge badge--brand">current</span>':'<a class="btn btn--secondary btn--sm">Choose</a>'}</div>`).join('')}
          </div></div>
      </div>
    </div></div>`;

  // ---- Redemption (redeem a code) -------------------------------------
  SCREENS.redemption = `<div class="yb-screen">${YB.navApp('dashboard')}
    <div class="yb-wrap page" style="max-width:760px">
      <div class="page__head"><div><h1 class="page__title">Redeem a code</h1><p class="page__sub">兑换充值码或礼品码。Add credit to your balance with a redemption code.</p></div></div>
      <div class="panel" style="margin-bottom:16px"><div class="panel__body" style="padding:32px">
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div class="field" style="flex:1"><label class="field__label">Redemption code</label><div class="input input--mono input--focus" style="height:52px;font-size:16px"><i data-lucide="ticket" style="width:18px;height:18px"></i><span class="strong">YB-GIFT-9F2A-3C71-B04E</span></div></div>
          <a class="btn btn--primary btn--lg" style="height:52px">Redeem <i data-lucide="arrow-right"></i></a>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:16px;padding:12px 14px;background:var(--success-subtle);border-radius:var(--radius-md)"><i data-lucide="check-circle-2" style="color:var(--success);width:18px;height:18px"></i><span style="font-size:14px;color:var(--text)">Valid code — <span class="strong">$50.00</span> will be added to your balance.</span></div>
      </div></div>
      <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Redemption history</span></div>
        <table class="table"><thead><tr><th>Code</th><th>Amount</th><th>Date</th><th class="r">Status</th></tr></thead>
        <tbody>${[['YB-GIFT-••••-A0F9','$50.00','Jun 6, 2026','Redeemed'],['YB-PROMO-••••-7BE2','$5.00','May 20, 2026','Redeemed'],['YB-GIFT-••••-11D4','$25.00','Apr 2, 2026','Redeemed']].map(([c,a,d,s])=>`<tr><td class="mono">${c}</td><td class="mono strong">${a}</td><td class="mono muted">${d}</td><td class="r"><span class="badge badge--success"><span class="bd"></span>${s}</span></td></tr>`).join('')}</tbody></table></div>
    </div></div>`;

  // ---- Performance metrics (monitoring) -------------------------------
  function areaMini(pts, color, w, h) {
    const max=Math.max(...pts)*1.15, n=pts.length;
    const line=pts.map((v,i)=>`${(i/(n-1))*w},${h-(v/max)*h}`).join(' ');
    const gid='pm'+Math.floor(Math.random()*99999);
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="0,${h} ${line} ${w},${h}" fill="url(#${gid})"/><polyline points="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  const provHealth = (name, logo, up, lat, err, st) => `<tr>
    <td><div class="cellflex"><span class="avatar-sm">${logo}</span><span class="strong" style="font-weight:500">${name}</span></div></td>
    <td><span class="badge ${st==='ok'?'badge--success':st==='warn'?'badge--warning':'badge--danger'}"><span class="bd"></span>${st==='ok'?'Operational':st==='warn'?'Degraded':'Down'}</span></td>
    <td class="mono r">${up}%</td><td class="mono r">${lat}</td><td class="mono r ${err>1?'down':''}">${err}%</td>
    <td style="width:120px"><div style="height:28px">${areaMini(st==='down'?[20,18,22,8,4,2,3]:[12,16,13,18,15,20,17],st==='down'?'var(--danger)':'var(--accent)',110,28)}</div></td></tr>`;
  SCREENS.performance = `<div class="yb-screen">${YB.navAdmin('activity')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Performance</h1><p class="page__sub">实时系统监控。Latency, uptime and error rates across providers and channels.</p></div>
        <div class="page__actions"><span class="chip"><span style="width:7px;height:7px;border-radius:50%;background:var(--success)"></span>All systems operational</span><div class="select" style="width:140px">Last 24 hours<i data-lucide="chevron-down"></i></div></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px">
        ${[['Uptime','99.98','%','up','+0.02%','var(--success)'],['p50 latency','0.46','s','down','−4%','var(--brand)'],['p99 latency','1.84','s','up','+6%','var(--brand)'],['Error rate','0.12','%','down','−0.3%','var(--accent)']].map(([l,v,u,d,delta,c])=>`<div class="statcard"><div class="statcard__label">${l}</div><div class="statcard__val">${v}<span class="u">${u}</span></div><div style="margin-top:12px;height:34px">${areaMini([14,18,15,22,19,24,21,26],c,260,34)}</div><div class="statcard__delta ${d}" style="margin-top:8px"><i data-lucide="trending-${d==='down'?'down':'up'}"></i>${delta}</div></div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-bottom:16px">
        <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// requests / sec</div><span class="panel__title" style="font-size:16px">Throughput</span></div><div class="tabs"><span class="tabs__t tabs__t--active">All</span><span class="tabs__t">2xx</span><span class="tabs__t">5xx</span></div></div>
          <div class="panel__body">${areaMini([120,150,135,180,165,210,190,240,220,265,250,290,270,310],'var(--brand)',700,180)}
          <div style="display:flex;justify-content:space-between;margin-top:10px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${['00:00','04:00','08:00','12:00','16:00','20:00','now'].map(t=>`<span>${t}</span>`).join('')}</div></div></div>
        <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Latency by region</span></div>
          <div class="panel__body" style="display:flex;flex-direction:column;gap:15px">
            ${[['us-east','0.38s',88],['eu-west','0.44s',74],['ap-shanghai','0.41s',80],['ap-tokyo','0.52s',62]].map(([r,l,p])=>`<div><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span class="strong" style="font-size:13px;font-weight:500">${r}</span><span class="mono secondary" style="font-size:13px">${l}</span></div><div class="bar bar--teal"><i style="width:${p}%"></i></div></div>`).join('')}
          </div></div>
      </div>
      <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Provider health</span><span class="badge badge--neutral">34 channels</span></div>
        <table class="table"><thead><tr><th>Provider</th><th>Status</th><th class="r">Uptime</th><th class="r">p50</th><th class="r">Errors</th><th>Trend</th></tr></thead>
        <tbody>${[['Anthropic','AN',99.99,'0.45s',0.1,'ok'],['OpenAI','OA',99.97,'0.36s',0.2,'ok'],['Google Vertex','GO',99.89,'0.58s',0.4,'ok'],['AWS Bedrock','AW',99.92,'0.51s',0.3,'ok'],['DeepSeek','DS',99.40,'1.10s',1.8,'warn'],['Together AI','TG',97.10,'—',12.0,'down']].map(r=>provHealth(...r)).join('')}</tbody></table></div>
    </div></div>`;

  // ---- Notifications ---------------------------------------------------
  const notif = (ic, color, t, body, time, unread) => `<div style="display:flex;gap:14px;padding:18px 22px;border-bottom:1px solid var(--divider);background:${unread?'var(--surface-2)':'transparent'}">
    <div style="width:36px;height:36px;border-radius:var(--radius-md);flex:none;display:flex;align-items:center;justify-content:center;background:var(--${color}-subtle);color:var(--${color})" class="ni"><i data-lucide="${ic}" style="width:17px;height:17px"></i></div>
    <div style="flex:1"><div style="display:flex;align-items:center;gap:8px"><span class="strong" style="font-weight:600;font-size:14px">${t}</span>${unread?'<span class="bd" style="width:7px;height:7px;border-radius:50%;background:var(--brand)"></span>':''}</div><p style="font-size:13px;color:var(--text-secondary);line-height:1.5;margin:3px 0 0">${body}</p></div>
    <span class="mono muted" style="font-size:12px;flex:none">${time}</span></div>`;
  SCREENS.notifications = `<div class="yb-screen">${YB.navApp('dashboard')}
    <div class="yb-wrap page" style="max-width:820px">
      <div class="page__head"><div><h1 class="page__title">Notifications</h1><p class="page__sub">Alerts about usage, billing and system health.</p></div>
        <div class="page__actions"><a class="btn btn--ghost btn--sm"><i data-lucide="check-check"></i> Mark all read</a><a class="btn btn--secondary btn--sm"><i data-lucide="settings"></i> Preferences</a></div></div>
      <div style="display:flex;gap:8px;margin-bottom:16px"><span class="chip chip--active">All <span class="mono" style="opacity:.6">12</span></span><span class="chip">Unread <span class="mono" style="opacity:.6">3</span></span><span class="chip">Billing</span><span class="chip">System</span></div>
      <div class="panel" style="overflow:hidden">
        <div style="padding:10px 22px;border-bottom:1px solid var(--divider)"><div class="yb-eyebrow">// today</div></div>
        ${notif('alert-triangle','warning','Budget threshold reached','Key "Production" has used 80% of its $300 monthly budget.','12m',true)}
        ${notif('zap','brand','New model available','Qwen 3 Max is now routable. Pass <span class="mono">alibaba/qwen-3-max</span> to try it.','1h',true)}
        ${notif('trending-up','success','Spend down 12%','Your weekly inference spend dropped vs last week thanks to smart routing.','3h',true)}
        <div style="padding:10px 22px;border-bottom:1px solid var(--divider)"><div class="yb-eyebrow">// earlier</div></div>
        ${notif('credit-card','accent','Top-up successful','$100.00 was added to your balance via Visa ending 42.','2d',false)}
        ${notif('server-crash','danger','Provider degraded','Together AI returned elevated errors. Traffic was auto-routed to healthy providers.','3d',false)}
        ${notif('user-plus','accent','New team member','Mara Okafor accepted your invite to the Driftwell org.','4d',false)}
      </div>
    </div></div>`;
})();
