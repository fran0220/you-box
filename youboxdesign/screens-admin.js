/* Admin + account screens */
(function () {
  // ---- Channels (upstream providers) ----------------------------------
  const chRow = (name, type, logo, models, prio, bal, lat, st) => `<tr>
    <td><div class="cellflex"><span class="avatar-sm">${logo}</span><div><div class="strong" style="font-weight:600">${name}</div><div class="sub mono">${type}</div></div></div></td>
    <td><span class="tag">${models} models</span></td>
    <td class="mono">${prio}</td>
    <td class="mono">${bal}</td>
    <td>${lat==='—'?'<span class="muted">—</span>':`<span class="badge ${parseFloat(lat)<1?'badge--success':'badge--warning'}"><span class="bd"></span>${lat}</span>`}</td>
    <td><span class="switch ${st?'switch--on':''}"></span></td>
    <td class="r"><span class="rowact"><span class="iconbtn"><i data-lucide="activity"></i></span><span class="iconbtn"><i data-lucide="pencil"></i></span><span class="iconbtn"><i data-lucide="more-horizontal"></i></span></span></td></tr>`;
  SCREENS.channels = `<div class="yb-screen">${YB.navAdmin('channels')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Channels</h1><p class="page__sub">上游渠道。Upstream providers YouBox routes to, with health, priority and balance.</p></div>
        <div class="page__actions"><a class="btn btn--secondary btn--sm"><i data-lucide="activity"></i> Test all</a><a class="btn btn--primary"><i data-lucide="plus"></i> Add channel</a></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
        ${[['Total channels','34','plug'],['Healthy','31','check-circle-2'],['Degraded','2','alert-triangle'],['Offline','1','x-circle']].map(([l,v,ic])=>`<div class="statcard"><div class="statcard__label"><i data-lucide="${ic}" class="ic"></i>${l}</div><div class="statcard__val">${v}</div></div>`).join('')}
      </div>
      <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">All channels</span>
        <div style="display:flex;gap:10px"><div class="tabs"><span class="tabs__t tabs__t--active">All</span><span class="tabs__t">Enabled</span><span class="tabs__t">Issues</span></div><div class="input" style="width:200px;height:36px"><i data-lucide="search"></i><span class="ph">Filter</span></div></div></div>
        <table class="table"><thead><tr><th>Channel</th><th>Models</th><th>Priority</th><th>Balance</th><th>Latency</th><th>Enabled</th><th></th></tr></thead>
        <tbody>${[
          ['Anthropic Direct','openai · anthropic','AN','38','1','$4,210','0.45s',true],
          ['OpenAI Direct','openai','OA','44','1','$2,880','0.36s',true],
          ['Google Vertex','gemini','GO','52','2','$1,940','0.58s',true],
          ['AWS Bedrock','anthropic','AW','61','2','$5,120','0.51s',true],
          ['DeepSeek','openai','DS','12','3','¥820','1.10s',true],
          ['Azure OpenAI','openai','AZ','40','3','$640','1.84s',false],
          ['Together AI','openai','TG','120','4','$210','—',false],
        ].map(r=>chRow(...r)).join('')}</tbody></table></div>
    </div></div>`;

  // ---- Users ----------------------------------------------------------
  const userRow = (name, email, init, role, bal, used, st) => `<tr>
    <td><div class="cellflex"><span class="avatar-sm">${init}</span><div><div class="strong" style="font-weight:600">${name}</div><div class="sub mono">${email}</div></div></div></td>
    <td><span class="badge ${role==='Admin'?'badge--brand':role==='Root'?'badge--info':'badge--neutral'}">${role}</span></td>
    <td class="mono">${bal}</td>
    <td class="mono">${used}</td>
    <td><span class="badge ${st==='Active'?'badge--success':'badge--danger'}"><span class="bd"></span>${st}</span></td>
    <td class="r"><span class="rowact"><span class="iconbtn"><i data-lucide="pencil"></i></span><span class="iconbtn"><i data-lucide="more-horizontal"></i></span></span></td></tr>`;
  SCREENS.users = `<div class="yb-screen">${YB.navAdmin('users')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Users</h1><p class="page__sub">8,420 registered users across all teams and groups.</p></div>
        <div class="page__actions"><a class="btn btn--secondary btn--sm"><i data-lucide="download"></i> Export</a><a class="btn btn--primary"><i data-lucide="user-plus"></i> Add user</a></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
        ${[['Total users','8,420','+124 this week','up'],['Active today','1,902','','flat'],['Paying','3,180','+38%','up'],['Total balance','$94.2K','','flat']].map(([l,v,d,dir])=>`<div class="statcard"><div class="statcard__label">${l}</div><div class="statcard__val">${v}</div>${d?`<div class="statcard__delta ${dir}"><i data-lucide="trending-up"></i>${d}</div>`:''}</div>`).join('')}
      </div>
      <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">All users</span>
        <div style="display:flex;gap:10px"><div class="tabs"><span class="tabs__t tabs__t--active">All</span><span class="tabs__t">Admins</span><span class="tabs__t">Banned</span></div><div class="input" style="width:220px;height:36px"><i data-lucide="search"></i><span class="ph">Search users</span></div></div></div>
        <table class="table"><thead><tr><th>User</th><th>Role</th><th>Balance</th><th>Used</th><th>Status</th><th></th></tr></thead>
        <tbody>${[
          ['Jordan Diaz','jordan@youbox.dev','JD','Root','$248.10','$1,204','Active'],
          ['Lin Wei','lin@pinecast.io','LW','Admin','$1,920','$8,410','Active'],
          ['Mara Okafor','mara@driftwell.app','MO','User','$84.20','$612','Active'],
          ['Sora Tanaka','sora@studio.jp','ST','User','$12.40','$2,180','Active'],
          ['Diego Ruiz','diego@latenta.mx','DR','User','$0.00','$48','Banned'],
          ['Aisha Khan','aisha@northwind.co','AK','Admin','$540.00','$3,920','Active'],
        ].map(r=>userRow(...r)).join('')}</tbody></table>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--divider)"><span class="muted" style="font-size:13px">Showing 6 of 8,420</span><div style="display:flex;gap:8px"><span class="btn btn--ghost btn--sm">Prev</span><span class="btn btn--secondary btn--sm">Next</span></div></div></div>
    </div></div>`;

  // ---- System settings ------------------------------------------------
  const navItem = (ic, l, active) => `<div class="nav__link ${active?'nav__link--active':''}" style="display:flex;align-items:center;gap:10px;padding:9px 12px;width:100%;justify-content:flex-start"><i data-lucide="${ic}" style="width:16px;height:16px"></i>${l}</div>`;
  const settingRow = (l, d, control) => `<div style="display:flex;align-items:center;gap:20px;padding:18px 0;border-bottom:1px solid var(--divider)"><div style="flex:1"><div class="strong" style="font-weight:500;font-size:14px">${l}</div><div class="muted" style="font-size:13px;margin-top:3px;line-height:1.5">${d}</div></div><div style="flex:none">${control}</div></div>`;
  SCREENS.settings = `<div class="yb-screen">${YB.navAdmin('settings')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">System settings</h1><p class="page__sub">站点、认证、计费与模型的全局配置。</p></div><div class="page__actions"><a class="btn btn--ghost btn--sm">Discard</a><a class="btn btn--primary btn--sm"><i data-lucide="check"></i> Save changes</a></div></div>
      <div style="display:grid;grid-template-columns:220px 1fr;gap:32px;align-items:start">
        <div style="display:flex;flex-direction:column;gap:2px;position:sticky;top:24px">
          ${navItem('settings','General',true)}${navItem('shield','Authentication')}${navItem('credit-card','Billing & pricing')}${navItem('box','Models & routing')}${navItem('lock','Security')}${navItem('bell','Notifications')}${navItem('terminal','Operations')}
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// general</div><span class="panel__title" style="font-size:16px">Site identity</span></div></div>
            <div class="panel__body" style="padding-top:4px">
              ${settingRow('Site name','Shown in the header, emails and the browser tab.', '<div class="input input--mono" style="width:240px"><span class="strong">YouBox</span></div>')}
              ${settingRow('Site URL','Base URL for callbacks and share links.', '<div class="input input--mono" style="width:240px"><span class="strong">api.youbox.dev</span></div>')}
              ${settingRow('Default language','New users start in this language.', '<div class="select" style="width:160px">简体中文<i data-lucide="chevron-down"></i></div>')}
              ${settingRow('Homepage','What anonymous visitors see at the root.', '<div class="select" style="width:160px">Marketing site<i data-lucide="chevron-down"></i></div>').replace('border-bottom:1px solid var(--divider)','')}
            </div></div>
          <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// access</div><span class="panel__title" style="font-size:16px">Registration & access</span></div></div>
            <div class="panel__body" style="padding-top:4px">
              ${settingRow('Allow new registrations','Let anyone create an account.', '<span class="switch switch--on"></span>')}
              ${settingRow('Require email verification','New accounts must confirm their email.', '<span class="switch switch--on"></span>')}
              ${settingRow('Free signup credit','Granted once on registration.', '<div class="input input--mono" style="width:160px"><span class="muted">$</span><span class="strong">5.00</span></div>')}
              ${settingRow('Invite-only mode','Disable public signup; require an invite code.', '<span class="switch"></span>').replace('border-bottom:1px solid var(--divider)','')}
            </div></div>
          <div class="panel"><div class="panel__head"><div><div class="yb-eyebrow" style="margin-bottom:3px">// pricing</div><span class="panel__title" style="font-size:16px">Billing</span></div></div>
            <div class="panel__body" style="padding-top:4px">
              ${settingRow('Token markup','Percentage added on top of provider rates.', '<div class="input input--mono" style="width:120px"><span class="strong">0</span><span class="muted">%</span></div>')}
              ${settingRow('Currency','Display & charge currency.', '<div class="select" style="width:120px">USD<i data-lucide="chevron-down"></i></div>')}
              ${settingRow('Payment providers','Enabled top-up methods.', '<div style="display:flex;gap:6px"><span class="tag">Stripe</span><span class="tag">支付宝</span><span class="tag">Creem</span></div>').replace('border-bottom:1px solid var(--divider)','')}
            </div></div>
        </div>
      </div>
    </div></div>`;

  // ---- Profile / account ----------------------------------------------
  SCREENS.profile = `<div class="yb-screen">${YB.navApp('dashboard')}
    <div class="yb-wrap page">
      <div class="page__head"><div><h1 class="page__title">Account</h1><p class="page__sub">管理你的个人资料、安全设置与连接的账户。</p></div></div>
      <div style="display:grid;grid-template-columns:300px 1fr;gap:32px;align-items:start">
        <div class="panel"><div class="panel__body" style="text-align:center">
          <div class="avatar" style="width:84px;height:84px;font-size:30px;margin:0 auto 14px">JD</div>
          <div style="font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--text-strong)">Jordan Diaz</div>
          <div class="mono muted" style="font-size:13px;margin-top:4px">jordan@youbox.dev</div>
          <div style="display:flex;gap:8px;justify-content:center;margin-top:14px"><span class="badge badge--info">Root</span><span class="badge badge--success"><span class="bd"></span>Verified</span></div>
          <a class="btn btn--secondary btn--sm btn--block" style="margin-top:18px"><i data-lucide="camera"></i> Change avatar</a>
          <hr class="divider" style="margin:20px 0">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px"><span class="muted">Member since</span><span class="strong mono">2024-08</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px"><span class="muted">Group</span><span class="strong">default</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px"><span class="muted">Requests</span><span class="strong mono">1.28M</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Profile</span></div>
            <div class="panel__body" style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
              <div class="field"><label class="field__label">Display name</label><div class="input"><span class="strong">Jordan Diaz</span></div></div>
              <div class="field"><label class="field__label">Username</label><div class="input input--mono"><span class="strong">jordandiaz</span></div></div>
              <div class="field"><label class="field__label">Email</label><div class="input"><i data-lucide="mail"></i><span>jordan@youbox.dev</span><span class="badge badge--success" style="margin-left:auto"><span class="bd"></span>verified</span></div></div>
              <div class="field"><label class="field__label">Timezone</label><div class="select">Asia / Shanghai (UTC+8)<i data-lucide="chevron-down"></i></div></div>
            </div></div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Security</span></div>
            <div class="panel__body" style="padding-top:6px">
              <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--divider)"><i data-lucide="key-round" style="color:var(--text-muted)"></i><div style="flex:1"><div class="strong" style="font-weight:500;font-size:14px">Password</div><div class="muted" style="font-size:13px">Last changed 3 months ago</div></div><a class="btn btn--secondary btn--sm">Change</a></div>
              <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--divider)"><i data-lucide="smartphone" style="color:var(--success)"></i><div style="flex:1"><div class="strong" style="font-weight:500;font-size:14px">Two-factor authentication <span class="badge badge--success" style="margin-left:4px"><span class="bd"></span>on</span></div><div class="muted" style="font-size:13px">Authenticator app · TOTP</div></div><a class="btn btn--ghost btn--sm">Manage</a></div>
              <div style="display:flex;align-items:center;gap:16px;padding:14px 0"><i data-lucide="fingerprint" style="color:var(--text-muted)"></i><div style="flex:1"><div class="strong" style="font-weight:500;font-size:14px">Passkeys</div><div class="muted" style="font-size:13px">1 passkey · MacBook Pro</div></div><a class="btn btn--secondary btn--sm">Add passkey</a></div>
            </div></div>
          <div class="panel"><div class="panel__head"><span class="panel__title" style="font-size:16px">Connected accounts</span></div>
            <div class="panel__body" style="padding-top:6px">
              ${[['github','GitHub','jordandiaz','linked'],['mail','Google','jordan@gmail.com','linked'],['message-circle','微信','—','connect']].map(([ic,l,v,st])=>`<div style="display:flex;align-items:center;gap:16px;padding:13px 0;${st==='connect'?'':'border-bottom:1px solid var(--divider)'}"><span style="color:var(--text-muted);display:flex">${ic==='github'?YB.gh:`<i data-lucide="${ic}"></i>`}</span><div style="flex:1"><div class="strong" style="font-weight:500;font-size:14px">${l}</div><div class="muted mono" style="font-size:13px">${v}</div></div>${st==='linked'?'<a class="btn btn--ghost btn--sm">Unlink</a>':'<a class="btn btn--secondary btn--sm">Connect</a>'}</div>`).join('')}
            </div></div>
        </div>
      </div>
    </div></div>`;
})();
