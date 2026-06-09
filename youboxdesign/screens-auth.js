/* Auth screens — sign in / sign up. Centered split layout. */
(function () {
  const oauthBtns = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <a class="btn btn--secondary">${YB.gh} GitHub</a>
    <a class="btn btn--secondary"><i data-lucide="mail"></i> Google</a>
    <a class="btn btn--secondary"><i data-lucide="message-circle"></i> 微信</a>
    <a class="btn btn--secondary"><i data-lucide="send"></i> LinuxDo</a>
  </div>`;

  const orDiv = `<div style="display:flex;align-items:center;gap:14px;color:var(--text-muted);font-size:12px;font-family:var(--font-mono)"><span style="flex:1;height:1px;background:var(--divider)"></span>OR<span style="flex:1;height:1px;background:var(--divider)"></span></div>`;

  const side = (eyebrow, quote, who) => `<div style="position:relative;overflow:hidden;background:var(--surface-card);border-left:1px solid var(--border);padding:56px;display:flex;flex-direction:column;justify-content:space-between">
    <div class="glow" style="top:-120px;right:-120px;width:420px;height:420px"></div>
    ${YB.brand()}
    <div>
      <p class="eyebrow" style="margin-bottom:18px">// ${eyebrow}</p>
      <p style="font-family:var(--font-display);font-size:30px;line-height:1.25;letter-spacing:-0.02em;color:var(--text-strong);font-weight:600;margin:0 0 22px">${quote}</p>
      <div style="display:flex;align-items:center;gap:11px"><span class="avatar">${who[0]}</span><div><div class="strong" style="font-weight:600;font-size:14px">${who[1]}</div><div class="mono muted" style="font-size:12px">${who[2]}</div></div></div>
    </div>
    <div style="display:flex;gap:32px">${[['312','models'],['34','providers'],['99.98%','uptime']].map(([v,l])=>`<div><div style="font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--text-strong)">${v}</div><div class="mono muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em">${l}</div></div>`).join('')}</div>
  </div>`;

  SCREENS.signIn = `<div class="yb-screen" style="display:grid;grid-template-columns:1fr 0.85fr;min-height:860px">
    <div style="display:flex;align-items:center;justify-content:center;padding:56px">
      <div style="width:100%;max-width:380px">
        <div style="margin-bottom:32px">${YB.brand()}</div>
        <h1 style="font-family:var(--font-display);font-size:30px;letter-spacing:-0.025em;font-weight:700;color:var(--text-strong);margin:0 0 8px">Sign in</h1>
        <p style="color:var(--text-secondary);font-size:15px;margin:0 0 28px">Welcome back. 登录以继续访问你的控制台。</p>
        ${oauthBtns}
        <div style="margin:22px 0">${orDiv}</div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="field"><label class="field__label">Email</label><div class="input"><i data-lucide="mail"></i><span>you@company.com</span></div></div>
          <div class="field"><div style="display:flex;justify-content:space-between"><label class="field__label">Password</label><a style="font-size:12px;color:var(--text-link)">Forgot?</a></div><div class="input"><i data-lucide="lock"></i><span class="ph">••••••••••••</span><i data-lucide="eye" style="margin-left:auto"></i></div></div>
          <a class="btn btn--primary btn--block btn--lg">Sign in <i data-lucide="arrow-right"></i></a>
        </div>
        <p style="text-align:center;font-size:14px;color:var(--text-secondary);margin-top:24px">New to YouBox? <a class="strong" style="color:var(--text-link)">Create an account</a></p>
      </div>
    </div>
    ${side('Trusted by 8,420 teams','"We swapped three provider integrations for one YouBox endpoint — and cut our inference bill by 40%."', ['L','Lin Wei','CTO · Pinecast'])}
  </div>`;

  SCREENS.signUp = `<div class="yb-screen" style="display:grid;grid-template-columns:1fr 0.85fr;min-height:920px">
    <div style="display:flex;align-items:center;justify-content:center;padding:56px">
      <div style="width:100%;max-width:380px">
        <div style="margin-bottom:32px">${YB.brand()}</div>
        <h1 style="font-family:var(--font-display);font-size:30px;letter-spacing:-0.025em;font-weight:700;color:var(--text-strong);margin:0 0 8px">Create your account</h1>
        <p style="color:var(--text-secondary);font-size:15px;margin:0 0 28px">Start with <span class="strong">$5 free credit</span>. No card required.</p>
        ${oauthBtns}
        <div style="margin:22px 0">${orDiv}</div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="field"><label class="field__label">Email</label><div class="input"><i data-lucide="mail"></i><span>you@company.com</span></div></div>
          <div class="field"><label class="field__label">Password</label><div class="input"><i data-lucide="lock"></i><span class="ph">At least 8 characters</span><i data-lucide="eye-off" style="margin-left:auto"></i></div>
            <div style="display:flex;gap:5px;margin-top:4px">${[1,1,1,0].map(f=>`<span class="bar" style="flex:1;height:4px"><i style="width:${f?100:0}%;${f?'':'background:transparent'}"></i></span>`).join('')}</div>
            <span class="field__hint">Strong — nice.</span></div>
          <label style="display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--text-secondary)"><span class="switch switch--on" style="flex:none"></span> I agree to the <a class="strong" style="color:var(--text-link)">Terms</a> & <a class="strong" style="color:var(--text-link)">Privacy Policy</a></label>
          <a class="btn btn--primary btn--block btn--lg">Create account <i data-lucide="arrow-right"></i></a>
        </div>
        <p style="text-align:center;font-size:14px;color:var(--text-secondary);margin-top:24px">Already have an account? <a class="strong" style="color:var(--text-link)">Sign in</a></p>
      </div>
    </div>
    ${side('Onboard in 60 seconds','"The drop-in OpenAI SDK meant zero rewrites. We were routing to five providers the same afternoon."', ['M','Mara Okafor','Eng Lead · Driftwell'])}
  </div>`;
})();
