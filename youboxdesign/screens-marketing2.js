/* Marketing / public — part 2: about, pricing plans, errors, legal */
(function () {
  // ---- About -----------------------------------------------------------
  const value = (ic, t, d) => `<div style="display:flex;flex-direction:column;gap:12px;padding:26px;background:var(--surface-card);border:1px solid var(--border);border-radius:var(--radius-lg)">
    <div style="width:42px;height:42px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;background:var(--brand-subtle);color:var(--brand)"><i data-lucide="${ic}" style="width:21px;height:21px"></i></div>
    <h3 style="font-size:18px;margin:0;letter-spacing:-0.01em;color:var(--text-strong)">${t}</h3>
    <p style="font-size:14px;color:var(--text-secondary);line-height:1.55;margin:0">${d}</p></div>`;
  SCREENS.about = `<div class="yb-screen">${YB.navMarketing('about')}
    <section style="position:relative;overflow:hidden;padding:90px 0 60px;text-align:center">
      <div class="glow" style="top:-180px;left:50%;transform:translateX(-50%);width:620px;height:480px"></div>
      <div class="yb-wrap" style="max-width:820px">
        <p class="eyebrow" style="margin-bottom:18px">// About YouBox</p>
        <h1 style="font-family:var(--font-display);font-size:54px;line-height:1.05;letter-spacing:-0.035em;font-weight:700;color:var(--text-strong);margin:0 0 22px">The routing layer for<br><span style="color:var(--brand)">every model.</span></h1>
        <p style="font-size:19px;line-height:1.6;color:var(--text-secondary);margin:0 auto;max-width:36em">We built YouBox because shipping on top of LLMs shouldn't mean maintaining a dozen SDKs, juggling rate limits, and rewriting every time a better model ships. 一个接口，连接所有前沿模型 — that's the whole idea.</p>
      </div>
    </section>
    <section style="padding:24px 0 64px"><div class="yb-wrap" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
      ${[['2024','founded'],['312','models routed'],['8,420','teams building'],['1.4T','tokens / day']].map(([v,l])=>`<div style="text-align:center;padding:28px;background:var(--surface-card);border:1px solid var(--border);border-radius:var(--radius-lg)"><div style="font-family:var(--font-display);font-weight:700;font-size:38px;letter-spacing:-0.03em;color:var(--text-strong)">${v}</div><div class="mono muted" style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-top:6px">${l}</div></div>`).join('')}
    </div></section>
    <section style="padding:48px 0 64px"><div class="yb-wrap">
      <div style="max-width:560px;margin-bottom:36px"><p class="eyebrow" style="margin-bottom:14px">// What we believe</p><h2 style="font-family:var(--font-display);font-size:34px;letter-spacing:-0.025em;font-weight:700;color:var(--text-strong);margin:0">Principles, not promises.</h2></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${value('git-branch','Provider-neutral','We don\'t make models. That means we route to whatever is best for you today — and switch the moment something better ships.')}
        ${value('receipt','No markup','You pay provider rates, full stop. We make money on platform tiers, never by taxing your tokens.')}
        ${value('lock','Yours to leave','OpenAI-compatible by design. If you ever want out, your code already works elsewhere. No lock-in.')}
      </div></div></section>
    <section style="padding:24px 0 80px"><div class="yb-wrap" style="text-align:center">
      <p class="eyebrow" style="margin-bottom:20px">// Backed by</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">${['Sequoia','a16z','Y Combinator','Hongshan','GGV','Index'].map(p=>`<span class="chip" style="height:38px;font-family:var(--font-display);font-weight:600">${p}</span>`).join('')}</div>
    </div></section>
    ${YB.footer()}</div>`;

  // ---- Public pricing (plans) -----------------------------------------
  const plan = (name, price, unit, desc, feats, featured, cta) => `<div style="display:flex;flex-direction:column;gap:18px;padding:30px;background:var(--surface-card);border:1px solid ${featured?'var(--brand-border)':'var(--border)'};border-radius:var(--radius-xl);${featured?'box-shadow:var(--glow-soft);position:relative':''}">
    ${featured?'<span class="badge badge--brand" style="position:absolute;top:24px;right:24px">Most popular</span>':''}
    <div><div style="font-family:var(--font-display);font-weight:600;font-size:17px;color:var(--text-strong)">${name}</div><p style="font-size:13px;color:var(--text-muted);margin:6px 0 0;line-height:1.5;min-height:38px">${desc}</p></div>
    <div style="font-family:var(--font-display);font-weight:700;font-size:42px;letter-spacing:-0.03em;line-height:1;display:flex;align-items:baseline;gap:6px;color:var(--text-strong)">${price}${unit?`<span style="font-family:var(--font-mono);font-size:14px;font-weight:400;color:var(--text-muted)">${unit}</span>`:''}</div>
    <a class="btn ${featured?'btn--primary':'btn--secondary'} btn--block">${cta}</a>
    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:11px;flex:1">${feats.map(f=>`<li style="display:flex;align-items:flex-start;gap:9px;font-size:14px;color:var(--text-secondary)"><i data-lucide="check" style="width:16px;height:16px;color:var(--success);flex:none;margin-top:1px"></i>${f}</li>`).join('')}</ul></div>`;
  SCREENS.pricing = `<div class="yb-screen">${YB.navMarketing('pricing')}
    <div class="yb-wrap page" style="text-align:center">
      <p class="eyebrow" style="margin-bottom:14px">// Pricing</p>
      <h1 class="page__title" style="font-size:46px;margin:0 auto">Pay for tokens, not the gateway.</h1>
      <p class="page__sub" style="margin:14px auto 0;font-size:18px">The platform is free to start. Token usage is billed at exact provider rates — no markup, ever.</p>
      <div style="display:inline-flex;margin:28px auto 36px"><div class="tabs"><span class="tabs__t tabs__t--active">Monthly</span><span class="tabs__t">Annual <span class="cnt">−20%</span></span></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;text-align:left;align-items:stretch">
        ${plan('Free','$0','','Get started with pass-through pricing.',['$5 free credit','All 312 models','10 requests / sec','Community support','Basic usage logs'],false,'Start free')}
        ${plan('Pro','$20','/ mo','For teams shipping to production.',['Everything in Free','100 requests / sec','Advanced analytics','Per-key budgets & limits','99.9% uptime SLA','Email support'],true,'Start Pro trial')}
        ${plan('Scale','Usage','','Volume routing with priority lanes.',['Everything in Pro','Custom rate limits','Priority routing lanes','Team & role management','SSO / SAML','Slack support'],false,'Contact sales')}
        ${plan('Enterprise','Custom','','Dedicated capacity & compliance.',['Everything in Scale','Dedicated capacity','VPC / on-prem deploy','SOC 2 · HIPAA · 数据合规','Custom SLA','Solutions engineer'],false,'Talk to us')}
      </div>
      <div style="margin-top:40px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:14px;color:var(--text-muted)"><i data-lucide="shield-check" style="width:16px;height:16px;color:var(--success)"></i> All plans include automatic failover, the full marketplace, and the OpenAI-compatible API.</div>
    </div>${YB.footer()}</div>`;

  // ---- Error pages -----------------------------------------------------
  const errorPage = (code, title, msg, ic) => `<div class="yb-screen" style="min-height:760px;display:flex;flex-direction:column">
    ${YB.navMarketing('')}
    <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:60px">
      <div class="glow" style="top:50%;left:50%;transform:translate(-50%,-50%);width:560px;height:420px"></div>
      <div style="text-align:center;position:relative;max-width:480px">
        <div style="width:64px;height:64px;border-radius:var(--radius-xl);background:var(--brand-subtle);color:var(--brand);display:flex;align-items:center;justify-content:center;margin:0 auto 28px"><i data-lucide="${ic}" style="width:30px;height:30px"></i></div>
        <div style="font-family:var(--font-display);font-weight:700;font-size:96px;letter-spacing:-0.04em;line-height:1;color:var(--text-strong)">${code}</div>
        <h1 style="font-family:var(--font-display);font-size:26px;letter-spacing:-0.02em;color:var(--text-strong);margin:18px 0 10px">${title}</h1>
        <p style="font-size:16px;color:var(--text-secondary);line-height:1.6;margin:0 0 28px">${msg}</p>
        <div style="display:flex;gap:12px;justify-content:center"><a class="btn btn--primary"><i data-lucide="arrow-left"></i> Back to home</a><a class="btn btn--secondary">Status page</a></div>
        <div class="mono muted" style="font-size:12px;margin-top:28px">request-id: 9f2a-3c71-b04e-a0f9</div>
      </div>
    </div></div>`;
  SCREENS.error404 = errorPage('404','Page not found','The page you\'re looking for doesn\'t exist or has moved. Check the URL, or head back to the dashboard.','compass');
  SCREENS.error500 = errorPage('500','Something broke','An unexpected error occurred on our side. We\'ve been notified — please retry in a moment.','server-crash');

  // ---- Legal / docs (page-style) --------------------------------------
  const toc = ['Overview','Data we collect','How we use data','Token & prompt handling','Data retention','Sub-processors','Your rights','Contact'];
  SCREENS.legal = `<div class="yb-screen">${YB.navMarketing('')}
    <div class="yb-wrap page" style="max-width:1080px">
      <div style="display:grid;grid-template-columns:220px 1fr;gap:48px;align-items:start">
        <div style="position:sticky;top:24px">
          <p class="eyebrow" style="margin-bottom:14px">// Legal</p>
          <div style="display:flex;flex-direction:column;gap:2px">${toc.map((t,i)=>`<div class="nav__link ${i===0?'nav__link--active':''}" style="justify-content:flex-start;padding:8px 12px">${t}</div>`).join('')}</div>
          <div class="mono muted" style="font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--divider)">Last updated<br>June 1, 2026</div>
        </div>
        <div style="max-width:660px">
          <h1 style="font-family:var(--font-display);font-size:38px;letter-spacing:-0.03em;font-weight:700;color:var(--text-strong);margin:0 0 8px">Privacy Policy</h1>
          <p style="color:var(--text-muted);font-size:14px;margin:0 0 32px">隐私政策 · How YouBox handles your data and prompts.</p>
          ${[
            ['Overview','YouBox Inc. ("YouBox", "we") operates an API gateway that routes requests to third-party model providers. This policy explains what we collect, why, and the controls you have. It applies to api.youbox.dev and the dashboard.'],
            ['Data we collect','Account data (email, organization), billing data processed by our payment partners, and request metadata — timestamps, model IDs, token counts, latency, and status codes. We use this to bill accurately and keep routing healthy.'],
            ['Token & prompt handling','By default, prompt and completion content is not stored. It transits our gateway in memory and is forwarded to the selected provider. You may opt in to short-term logging for debugging from the dashboard; logs auto-expire after 24 hours.'],
            ['Data retention','Request metadata is retained for 90 days for analytics and abuse prevention, then aggregated. Account and billing records are kept as required by law. You can request deletion at any time.'],
          ].map(([h,b])=>`<h2 style="font-family:var(--font-display);font-size:21px;letter-spacing:-0.01em;color:var(--text-strong);margin:32px 0 12px">${h}</h2><p style="font-size:16px;color:var(--text-secondary);line-height:1.7;margin:0">${b}</p>`).join('')}
          <div class="panel" style="margin-top:32px;background:var(--brand-subtle);border-color:var(--brand-border)"><div class="panel__body" style="display:flex;gap:14px;align-items:flex-start"><i data-lucide="info" style="color:var(--brand);width:20px;height:20px;flex:none"></i><p style="font-size:14px;color:var(--text);line-height:1.6;margin:0">For data-processing agreements (DPA) or enterprise compliance questions (SOC 2, HIPAA, 数据出境), contact <span class="strong">legal@youbox.dev</span>.</p></div></div>
        </div>
      </div>
    </div>${YB.footer()}</div>`;
})();
