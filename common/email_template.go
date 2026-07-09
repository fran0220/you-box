package common

import (
	"bytes"
	"fmt"
	"html"
	"html/template"
	"strings"
	"sync"
)

// Configurable email template option keys.
const (
	OptionEmailVerificationSubject = "EmailVerificationSubject"
	OptionEmailVerificationHTML    = "EmailVerificationHTML"
	OptionPasswordResetSubject     = "PasswordResetSubject"
	OptionPasswordResetHTML        = "PasswordResetHTML"
)

var (
	emailTemplateMu              sync.RWMutex
	emailVerificationSubjectTmpl string
	emailVerificationHTMLTmpl    string
	passwordResetSubjectTmpl     string
	passwordResetHTMLTmpl        string
)

// EmailTemplateData is the variable set available to custom templates.
type EmailTemplateData struct {
	SystemName   string
	Code         string
	ValidMinutes int
	ResetLink    string
	Year         int
}

// SetEmailTemplates updates runtime custom templates.
// Empty values fall back to built-in defaults when rendering.
func SetEmailTemplates(verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	emailTemplateMu.Lock()
	defer emailTemplateMu.Unlock()
	emailVerificationSubjectTmpl = verificationSubject
	emailVerificationHTMLTmpl = verificationHTML
	passwordResetSubjectTmpl = resetSubject
	passwordResetHTMLTmpl = resetHTML
}

// GetEmailTemplates returns currently configured template strings.
func GetEmailTemplates() (verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	emailTemplateMu.RLock()
	defer emailTemplateMu.RUnlock()
	return emailVerificationSubjectTmpl, emailVerificationHTMLTmpl, passwordResetSubjectTmpl, passwordResetHTMLTmpl
}

// DefaultEmailTemplates returns built-in subject/html templates for admin UI.
func DefaultEmailTemplates() (verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	return defaultVerificationSubjectTemplate(),
		defaultVerificationHTMLTemplate(),
		defaultPasswordResetSubjectTemplate(),
		defaultPasswordResetHTMLTemplate()
}

// RenderVerificationEmail builds subject/body for registration email codes.
func RenderVerificationEmail(systemName, code string, validMinutes int) (subject string, htmlBody string) {
	data := EmailTemplateData{
		SystemName:   emailBrandName(systemName),
		Code:         code,
		ValidMinutes: validMinutes,
	}
	subjectTmpl, htmlTmpl, _, _ := snapshotTemplates()
	subject = renderTemplateOrDefault("verification-subject", subjectTmpl, defaultVerificationSubjectTemplate(), data)
	htmlBody = renderTemplateOrDefault("verification-html", htmlTmpl, defaultVerificationHTMLTemplate(), data)
	return subject, htmlBody
}

// RenderPasswordResetEmail builds subject/body for password reset links.
func RenderPasswordResetEmail(systemName, resetLink string, validMinutes int) (subject string, htmlBody string) {
	data := EmailTemplateData{
		SystemName:   emailBrandName(systemName),
		ResetLink:    resetLink,
		ValidMinutes: validMinutes,
	}
	_, _, subjectTmpl, htmlTmpl := snapshotTemplates()
	subject = renderTemplateOrDefault("reset-subject", subjectTmpl, defaultPasswordResetSubjectTemplate(), data)
	htmlBody = renderTemplateOrDefault("reset-html", htmlTmpl, defaultPasswordResetHTMLTemplate(), data)
	return subject, htmlBody
}

// PreviewEmailTemplate renders an arbitrary subject/html pair with sample data.
// Empty subject/html fall back to built-in defaults for the given kind.
// kind: "verification" | "password_reset"
func PreviewEmailTemplate(kind, subjectTmpl, htmlTmpl string) (subject string, htmlBody string, err error) {
	kind = strings.TrimSpace(strings.ToLower(kind))
	var (
		defaultSubject string
		defaultHTML    string
		data           EmailTemplateData
	)
	switch kind {
	case "verification", "email_verification", "verify":
		defaultSubject, defaultHTML, _, _ = DefaultEmailTemplates()
		data = EmailTemplateData{
			SystemName:   emailBrandName(SystemName),
			Code:         "123456",
			ValidMinutes: VerificationValidMinutes,
		}
	case "password_reset", "reset", "password":
		_, _, defaultSubject, defaultHTML = DefaultEmailTemplates()
		data = EmailTemplateData{
			SystemName:   emailBrandName(SystemName),
			ResetLink:    "https://example.com/user/reset?email=demo@example.com&token=preview-token",
			ValidMinutes: VerificationValidMinutes,
		}
	default:
		return "", "", fmt.Errorf("unknown email template kind: %s", kind)
	}

	if strings.TrimSpace(subjectTmpl) == "" {
		subjectTmpl = defaultSubject
	}
	if strings.TrimSpace(htmlTmpl) == "" {
		htmlTmpl = defaultHTML
	}
	subject, err = executeEmailTemplate("preview-subject", subjectTmpl, data)
	if err != nil {
		return "", "", err
	}
	htmlBody, err = executeEmailTemplate("preview-html", htmlTmpl, data)
	if err != nil {
		return "", "", err
	}
	return subject, htmlBody, nil
}

// ValidateEmailTemplate parses a template string with EmailTemplateData fields.
func ValidateEmailTemplate(name, tmpl string) error {
	if strings.TrimSpace(tmpl) == "" {
		return nil
	}
	_, err := template.New(name).Option("missingkey=zero").Parse(tmpl)
	return err
}

func snapshotTemplates() (verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	emailTemplateMu.RLock()
	defer emailTemplateMu.RUnlock()
	return emailVerificationSubjectTmpl, emailVerificationHTMLTmpl, passwordResetSubjectTmpl, passwordResetHTMLTmpl
}

func renderTemplateOrDefault(name, custom, fallback string, data EmailTemplateData) string {
	src := strings.TrimSpace(custom)
	if src == "" {
		src = fallback
	}
	out, err := executeEmailTemplate(name, src, data)
	if err != nil {
		// Never fail auth emails because of a bad admin template.
		SysError(fmt.Sprintf("email template %s render failed: %v; falling back to default", name, err))
		out, err = executeEmailTemplate(name+"-fallback", fallback, data)
		if err != nil {
			return html.EscapeString(fmt.Sprintf("%s", data.Code))
		}
	}
	return out
}

func executeEmailTemplate(name, src string, data EmailTemplateData) (string, error) {
	tmpl, err := template.New(name).Option("missingkey=zero").Parse(src)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func emailBrandName(systemName string) string {
	name := strings.TrimSpace(systemName)
	if name == "" {
		name = strings.TrimSpace(SystemName)
	}
	if name == "" {
		return "YouBox"
	}
	return name
}

func defaultVerificationSubjectTemplate() string {
	return `{{.SystemName}} · 邮箱验证码`
}

func defaultPasswordResetSubjectTemplate() string {
	return `{{.SystemName}} · 密码重置`
}

func defaultVerificationHTMLTemplate() string {
	// Keep markup email-client friendly and brand-neutral.
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{.SystemName}} 邮箱验证</title>
</head>
<body style="margin:0;padding:0;background:#f3efe8;color:#1f1b16;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3efe8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fffdf9;border:1px solid #e7e1d7;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;border-bottom:1px solid #efe9e0;">
              <p style="margin:0 0 6px;color:#7a746b;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">邮箱验证</p>
              <h1 style="margin:0;font-size:22px;line-height:1.35;font-weight:600;color:#1f1b16;font-family:Georgia,'Times New Roman',serif;">确认你的邮箱地址</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <p style="margin:0 0 18px;color:#5c574f;font-size:15px;line-height:1.7;">你正在注册或绑定 {{.SystemName}}。请使用下面的验证码完成验证。</p>
              <p style="margin:0 0 10px;color:#7a746b;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">验证码</p>
              <div style="margin:0 0 18px;padding:18px 16px;border:1px solid #e7e1d7;border-radius:12px;background:#faf7f2;text-align:center;">
                <span style="display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:32px;line-height:1.2;letter-spacing:0.28em;font-weight:600;color:#1f1b16;">{{.Code}}</span>
              </div>
              <p style="margin:18px 0 0;color:#7a746b;font-size:13px;line-height:1.6;">此验证码将在 <strong style="color:#1f1b16;">{{.ValidMinutes}}</strong> 分钟内有效。</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;color:#8a847b;font-size:12px;line-height:1.7;">如果这不是你本人的操作，请忽略这封邮件。验证码仅用于完成验证，请勿转发。</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#9a948b;font-size:12px;line-height:1.6;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{.SystemName}}</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

func defaultPasswordResetHTMLTemplate() string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{.SystemName}} 密码重置</title>
</head>
<body style="margin:0;padding:0;background:#f3efe8;color:#1f1b16;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3efe8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fffdf9;border:1px solid #e7e1d7;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;border-bottom:1px solid #efe9e0;">
              <p style="margin:0 0 6px;color:#7a746b;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">账户安全</p>
              <h1 style="margin:0;font-size:22px;line-height:1.35;font-weight:600;color:#1f1b16;font-family:Georgia,'Times New Roman',serif;">重置你的密码</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <p style="margin:0 0 18px;color:#5c574f;font-size:15px;line-height:1.7;">我们收到了重置 {{.SystemName}} 账户密码的请求。点击下方按钮继续。</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
                <tr>
                  <td style="border-radius:10px;background:#1f1b16;">
                    <a href="{{.ResetLink}}" style="display:inline-block;padding:12px 18px;color:#faf7f2;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.02em;">重置密码</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;color:#5c574f;font-size:14px;line-height:1.6;">如果按钮无法点击，请复制以下链接到浏览器打开：</p>
              <p style="margin:0;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.6;color:#1f1b16;">{{.ResetLink}}</p>
              <p style="margin:18px 0 0;color:#7a746b;font-size:13px;line-height:1.6;">此链接将在 <strong style="color:#1f1b16;">{{.ValidMinutes}}</strong> 分钟内有效。</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;color:#8a847b;font-size:12px;line-height:1.7;">如果这不是你本人的操作，请忽略这封邮件。你的密码不会被更改，除非有人通过此链接完成重置。</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#9a948b;font-size:12px;line-height:1.6;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{.SystemName}}</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}
