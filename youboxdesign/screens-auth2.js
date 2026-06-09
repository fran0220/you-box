/* Auth — part 2: forgot password, reset, OTP / 2FA. Single-card centered. */
(function () {
  const shell = (inner, h) => `<div class="yb-screen" style="min-height:${h||760}px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:48px">
    <div class="glow" style="top:-160px;left:50%;transform:translateX(-50%);width:560px;height:420px"></div>
    <div style="width:100%;max-width:400px;position:relative">${inner}</div></div>`;

  SCREENS.forgotPassword = shell(`
    <div style="margin-bottom:28px;display:flex;justify-content:center">${YB.brand()}</div>
    <div class="panel"><div class="panel__body" style="padding:32px">
      <h1 style="font-family:var(--font-display);font-size:24px;letter-spacing:-0.02em;font-weight:700;color:var(--text-strong);margin:0 0 8px">Reset your password</h1>
      <p style="color:var(--text-secondary);font-size:14px;margin:0 0 24px;line-height:1.55">Enter your account email and we'll send a reset link. 输入邮箱以接收重置链接。</p>
      <div class="field" style="margin-bottom:18px"><label class="field__label">Email</label><div class="input"><i data-lucide="mail"></i><span>you@company.com</span></div></div>
      <a class="btn btn--primary btn--block btn--lg">Send reset link <i data-lucide="arrow-right"></i></a>
    </div></div>
    <p style="text-align:center;font-size:14px;color:var(--text-secondary);margin-top:22px"><a class="strong" style="color:var(--text-link)"><i data-lucide="arrow-left" style="width:14px;height:14px;vertical-align:-2px"></i> Back to sign in</a></p>`);

  SCREENS.resetPassword = shell(`
    <div style="margin-bottom:28px;display:flex;justify-content:center">${YB.brand()}</div>
    <div class="panel"><div class="panel__body" style="padding:32px">
      <div style="width:48px;height:48px;border-radius:var(--radius-lg);background:var(--success-subtle);color:var(--success);display:flex;align-items:center;justify-content:center;margin-bottom:18px"><i data-lucide="shield-check" style="width:24px;height:24px"></i></div>
      <h1 style="font-family:var(--font-display);font-size:24px;letter-spacing:-0.02em;font-weight:700;color:var(--text-strong);margin:0 0 8px">Set a new password</h1>
      <p style="color:var(--text-secondary);font-size:14px;margin:0 0 24px">Choose a strong password for <span class="strong mono">jordan@youbox.dev</span>.</p>
      <div class="field" style="margin-bottom:16px"><label class="field__label">New password</label><div class="input"><i data-lucide="lock"></i><span class="ph">At least 8 characters</span><i data-lucide="eye" style="margin-left:auto"></i></div>
        <div style="display:flex;gap:5px;margin-top:8px">${[1,1,1,0].map(f=>`<span class="bar" style="flex:1;height:4px"><i style="width:${f?100:0}%;${f?'':'background:transparent'}"></i></span>`).join('')}</div></div>
      <div class="field" style="margin-bottom:20px"><label class="field__label">Confirm password</label><div class="input"><i data-lucide="lock"></i><span class="ph">Re-enter password</span></div></div>
      <a class="btn btn--primary btn--block btn--lg">Update password</a>
    </div></div>`);

  SCREENS.otp = shell(`
    <div style="margin-bottom:28px;display:flex;justify-content:center">${YB.brand()}</div>
    <div class="panel"><div class="panel__body" style="padding:32px;text-align:center">
      <div style="width:48px;height:48px;border-radius:var(--radius-lg);background:var(--brand-subtle);color:var(--brand);display:flex;align-items:center;justify-content:center;margin:0 auto 18px"><i data-lucide="smartphone" style="width:24px;height:24px"></i></div>
      <h1 style="font-family:var(--font-display);font-size:24px;letter-spacing:-0.02em;font-weight:700;color:var(--text-strong);margin:0 0 8px">Two-factor authentication</h1>
      <p style="color:var(--text-secondary);font-size:14px;margin:0 0 24px;line-height:1.55">Enter the 6-digit code from your authenticator app.<br>输入验证码以继续。</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:22px">${['4','9','2','','',''].map((d,i)=>`<div style="width:48px;height:56px;border-radius:var(--radius-md);border:1px solid ${i===3?'var(--brand-border)':'var(--field-border)'};background:var(--field-bg);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:24px;font-weight:600;color:var(--text-strong);${i===3?'box-shadow:var(--ring)':''}">${d||(i===3?'<span style="width:2px;height:24px;background:var(--brand)"></span>':'')}</div>`).join('')}</div>
      <a class="btn btn--primary btn--block btn--lg">Verify <i data-lucide="arrow-right"></i></a>
      <p style="font-size:13px;color:var(--text-muted);margin-top:18px">Didn't get a code? <a class="strong" style="color:var(--text-link)">Resend in 0:24</a></p>
    </div></div>
    <p style="text-align:center;font-size:13px;color:var(--text-muted);margin-top:20px">Lost your device? <a class="strong" style="color:var(--text-link)">Use a backup code</a></p>`);
})();
