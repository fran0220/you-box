/* Admin — part 2: setup wizard, settings (models, security), redemption admin */
(function () {
  // ---- Setup wizard (first run) ---------------------------------------
  const step = (n, t, state) => `<div style="display:flex;align-items:center;gap:11px">
    <span style="width:28px;height:28px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:600;${state==='done'?'background:var(--success);color:#fff':state==='active'?'background:var(--brand);color:var(--brand-on)':'background:var(--surface-3);color:var(--text-muted)'}">${state==='done'?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>':n}</span>
    <span style="font-size:14px;font-weight:${state==='active'?600:500};color:${state==='pending'?'var(--text-muted)':'var(--text)'}">${t}</span></div>`;
  SCREENS.setup = `<div class="yb-screen" style="min-height:820px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:48px">
    <div class="glow" style="top:-160px;left:50%;transform:translateX(-50%);width:600px;height:440px"></div>
    <div style="width:100%;max-width:680px;position:relative">
      <div style="text-align:center;margin-bottom:28px"><div style="display:inline-flex;margin-bottom:14px">${YB.brand()}</div><h1 style="font-family:var(--font-display);font-size:28px;letter-spacing:-0.025em;font-weight:700;color:var(--text-strong);margin:0 0 6px">Welcome — let's set up YouBox</h1><p style="color:var(--text-secondary);font-size:15px;margin:0">初始化你的网关实例。This runs once on a fresh instance.</p></div>
      <div class="panel"><div class="panel__body" style="padding:0">
        <div style="display:flex;align-items:center;gap:24px;padding:20px 28px;border-bottom:1px solid var(--divider)">
          ${step(1,'Database','done')}<span style="flex:1;height:1px;background:var(--divider)"></span>${step(2,'Admin account','active')}<span style="flex:1;height:1px;background:var(--divider)"></span>${step(3,'Site config','pending')}
        </div>
        <div style="padding:28px">
          <div class="yb-eyebrow" style="margin-bottom:16px">// step 2 — create the root administrator</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div class="field"><label class="field__label">Admin username</label><div class="input input--mono"><span class="strong">root</span></div></div>
            <div class="field"><label class="field__label">Email</label><div class="input"><i data-lucide="mail"></i><span>admin@youbox.dev</span></div></div>
            <div class="field"><label class="field__label">Password</label><div class="input"><i data-lucide="lock"></i><span class="ph">Strong password</span></div></div>
            <div class="field"><label class="field__label">Confirm password</label><div class="input"><i data-lucide="lock"></i><span class="ph">Repeat password</span></div></div>
          </div>
          <label style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-secondary);margin-bottom:22px"><span class="switch switch--on"></span> Enable two-factor authentication for this account</label>
          <div style="display:flex;justify-content:space-between"><a class="btn btn--ghost"><i data-lucide="arrow-left"></i> Back</a><a class="btn btn--primary">Continue <i data-lucide="arrow-right"></i></a></div>
        </div>
      </div></div>
      <p class="mono muted" style="text-align:center;font-size:12px;margin-top:18px">YouBox v0.4 · PostgreSQL connected · Redis connected</p>
    </div></div>`;

  // ---- Settings shell (reused) ----------------------------------------
  const navItem = (ic, l, active) => `<div class="nav__link ${active?'nav__link--active':''}" style="display:flex;align-items:center;gap:10px;padding:9px 12px;width:100%;justify-content:flex-start"><i data-lucide="${ic}" style="width:16px;height:16px"></i>${l}</div>`;
  const settingsRail = (active) => `<div style="display:flex;flex-direction:column;gap:2px;position:sticky;top:24px">
    ${navItem('settings','General',active==='general')}${navItem('shield','Authentication',active==='auth')}${navItem('credit-card','Billing & pricing',active==='billing')}${navItem('box','Models & routing',active==='models')}${navItem('lock','Security',active==='security')}${navItem('bell','Notifications',active==='notif')}${navItem('terminal','Operations',active==='ops')}</div>`;
  const settingRow = (l, d, control, last) => `<div style="display:flex;align-items:center;gap:20px;padding:18px 0;${last?'':'border-bottom:1px solid var(--divider)'}"><div style="flex:1"><div class="strong" style="font-weight:500;font-size:14px">${l}</div><div class="muted" style="font-size:13px;margin-top:3px;line-height:1.5">${d}</div></div><div style="flex:none">${control}</div></div>`;

  // Models & routing settings (pricing table + routing rules)
  const priceRow = (m, enabled) => `<tr>
    <td><div class="cellflex"><span class="avatar-sm">${m.logo}</span><div><div class="strong" style="font-weight:500">${m.name}</div><div class="sub mono">${m.prov.toLowerCase()}/${m.id}</div></div></div></td>
    <td class="mono">${m.pin!=null?'$'+m.pin:'—'}</td><td class="mono">${m.pout!=null?'$'+m.pout:'—'}</td>
    <td class="mono"><span class="strong">×1.0</span></td>
    <td><span class="switch ${enabled?'switch--on':''}"></span></td>
    <td class="r"><span class="iconbtn"><i data-lucide="pencil"></i></span></td></tr>`;
  SCREENS.settingsModels = `<div class="yb-screen">${YB.navAdmin('settings')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">System settings</h1><p class="page__sub">模型与路由配置。Per-model pricing, multipliers and routing strategy.</p></div><div class="page__actions"><a class="btn btn--ghost btn--sm">Discard</a><a class="btn btn--primary btn--sm"><i data-lucide="check"></i> Save changes</a></div></div>
      <div style="display:grid;grid-template-columns:220px 1fr;gap:32px;align-items:start">
        ${settingsRail('models')}
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// routing</div><span class="panel__title" style="font-size:16px">Routing strategy</span></div></div>
            <div class="panel__body" style="padding-top:4px">
              ${settingRow('Default strategy','How YouBox picks a provider when several can serve a model.','<div class="select" style="width:200px">Lowest cost (meets SLA)<i data-lucide="chevron-down"></i></div>')}
              ${settingRow('Automatic failover','Retry the next-best provider on error or timeout.','<span class="switch switch--on"></span>')}
              ${settingRow('Failover attempts','Max providers to try before returning an error.','<div class="input input--mono" style="width:90px"><span class="strong">3</span></div>')}
              ${settingRow('Streaming','Allow server-sent streaming responses.','<span class="switch switch--on"></span>',true)}
            </div></div>
          <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// catalog</div><span class="panel__title" style="font-size:16px">Model pricing</span></div>
            <div style="display:flex;gap:10px"><div class="input" style="width:180px;height:36px"><i data-lucide="search"></i><span class="ph">Filter models</span></div><a class="btn btn--secondary btn--sm"><i data-lucide="refresh-cw"></i> Sync rates</a></div></div>
            <table class="table"><thead><tr><th>Model</th><th>Input / 1M</th><th>Output / 1M</th><th>Multiplier</th><th>Enabled</th><th></th></tr></thead>
            <tbody>${YB.MODELS.slice(0,6).map((m,i)=>priceRow(m, i!==4)).join('')}</tbody></table></div>
        </div>
      </div>
    </div></div>`;

  // Security settings
  SCREENS.settingsSecurity = `<div class="yb-screen">${YB.navAdmin('settings')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">System settings</h1><p class="page__sub">安全策略。Access control, rate limits and abuse protection.</p></div><div class="page__actions"><a class="btn btn--ghost btn--sm">Discard</a><a class="btn btn--primary btn--sm"><i data-lucide="check"></i> Save changes</a></div></div>
      <div style="display:grid;grid-template-columns:220px 1fr;gap:32px;align-items:start">
        ${settingsRail('security')}
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// access</div><span class="panel__title" style="font-size:16px">Authentication policy</span></div></div>
            <div class="panel__body" style="padding-top:4px">
              ${settingRow('Require 2FA for admins','Admins must enable two-factor authentication.','<span class="switch switch--on"></span>')}
              ${settingRow('Allow passkeys','Let users sign in with WebAuthn passkeys.','<span class="switch switch--on"></span>')}
              ${settingRow('Session timeout','Sign users out after this idle period.','<div class="select" style="width:140px">7 days<i data-lucide="chevron-down"></i></div>')}
              ${settingRow('IP allowlist','Restrict the admin console to these CIDRs.','<div class="input input--mono" style="width:200px"><span class="muted">10.0.0.0/8, …</span></div>',true)}
            </div></div>
          <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// limits</div><span class="panel__title" style="font-size:16px">Rate limiting & abuse</span></div></div>
            <div class="panel__body" style="padding-top:4px">
              ${settingRow('Global rate limit','Default ceiling per key, requests per second.','<div class="input input--mono" style="width:120px"><span class="strong">100</span><span class="muted">/s</span></div>')}
              ${settingRow('Sensitive-content filter','Block prompts matching the moderation policy.','<span class="switch switch--on"></span>')}
              ${settingRow('SSRF protection','Validate outbound URLs in tool calls.','<span class="switch switch--on"></span>')}
              ${settingRow('Anonymous access','Allow unauthenticated requests to public models.','<span class="switch"></span>',true)}
            </div></div>
        </div>
      </div>
    </div></div>`;

  // ---- Redemption codes (admin) ---------------------------------------
  const codeRow = (code, val, used, total, status) => `<tr>
    <td class="mono"><span class="strong">${code}</span></td>
    <td class="mono">$${val}</td>
    <td class="mono">${used} / ${total}</td>
    <td style="width:160px"><div class="bar"><i style="width:${(used/total)*100}%"></i></div></td>
    <td><span class="badge ${status==='Active'?'badge--success':status==='Used'?'badge--neutral':'badge--warning'}"><span class="bd"></span>${status}</span></td>
    <td class="r"><span class="rowact"><span class="iconbtn"><i data-lucide="copy"></i></span><span class="iconbtn"><i data-lucide="trash-2"></i></span></span></td></tr>`;
  SCREENS.redemptionAdmin = `<div class="yb-screen">${YB.navAdmin('settings')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Redemption codes</h1><p class="page__sub">生成与管理充值码。Generate and track credit codes for users.</p></div></div>
      <div style="display:grid;grid-template-columns:340px 1fr;gap:24px;align-items:start">
        <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Generate codes</span></div>
          <div class="panel__body" style="display:flex;flex-direction:column;gap:16px">
            <div class="field"><label class="field__label">Value per code (USD)</label><div class="input input--mono"><span class="muted">$</span><span class="strong">50.00</span></div></div>
            <div class="field"><label class="field__label">Quantity</label><div class="input input--mono"><span class="strong">25</span></div></div>
            <div class="field"><label class="field__label">Max uses per code</label><div class="input input--mono"><span class="strong">1</span></div></div>
            <div class="field"><label class="field__label">Expires</label><div class="select">In 90 days<i data-lucide="chevron-down"></i></div></div>
            <a class="btn btn--primary btn--block"><i data-lucide="sparkles"></i> Generate 25 codes</a>
            <p class="muted" style="font-size:12px;text-align:center;line-height:1.5">Codes are shown once after generation. Export the CSV to distribute.</p>
          </div></div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
            ${[['Codes issued','1,240'],['Active','382'],['Value redeemed','$42.8K']].map(([l,v])=>`<div class="statcard"><div class="statcard__label">${l}</div><div class="statcard__val" style="font-size:26px">${v}</div></div>`).join('')}
          </div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Recent batches</span><div class="input" style="width:200px;height:36px"><i data-lucide="search"></i><span class="ph">Search code</span></div></div>
            <table class="table"><thead><tr><th>Code</th><th>Value</th><th>Used</th><th>Progress</th><th>Status</th><th></th></tr></thead>
            <tbody>${[
              ['YB-GIFT-9F2A-3C71',50,0,1,'Active'],['YB-GIFT-A0F9-7BE2',50,1,1,'Used'],['YB-PROMO-11D4-8A3C',5,142,500,'Active'],['YB-GIFT-B04E-2D9F',25,0,1,'Active'],['YB-TRIAL-6C1B-4F0A',10,38,100,'Active'],['YB-GIFT-EXPD-0000',50,0,1,'Expired'],
            ].map(r=>codeRow(...r)).join('')}</tbody></table></div>
        </div>
      </div>
    </div></div>`;
})();
