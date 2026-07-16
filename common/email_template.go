package common

import (
	"bytes"
	"fmt"
	"html"
	"html/template"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"time"
)

// Configurable email template option keys.
// Brand keys are the primary admin controls; raw HTML keys remain for
// backward compatibility and advanced overrides only.
const (
	OptionEmailBrandName           = "EmailBrandName"
	OptionEmailBrandLogoURL        = "EmailBrandLogoURL"
	OptionEmailBrandPrimaryColor   = "EmailBrandPrimaryColor"
	OptionEmailBrandFooterText     = "EmailBrandFooterText"
	OptionEmailVerificationSubject = "EmailVerificationSubject"
	OptionEmailVerificationTitle   = "EmailVerificationTitle"
	OptionEmailVerificationLead    = "EmailVerificationLead"
	OptionPasswordResetSubject     = "PasswordResetSubject"
	OptionPasswordResetTitle       = "PasswordResetTitle"
	OptionPasswordResetLead        = "PasswordResetLead"
	OptionPasswordResetButtonText  = "PasswordResetButtonText"
	// Legacy raw HTML overrides (still honored if non-empty).
	OptionEmailVerificationHTML = "EmailVerificationHTML"
	OptionPasswordResetHTML     = "PasswordResetHTML"
)

var hexColorPattern = regexp.MustCompile(`(?i)^#([0-9a-f]{3}|[0-9a-f]{6})$`)

var (
	emailTemplateMu sync.RWMutex

	emailBrandName         string
	emailBrandLogoURL      string
	emailBrandPrimaryColor string
	emailBrandFooterText   string

	emailVerificationSubject string
	emailVerificationTitle   string
	emailVerificationLead    string
	passwordResetSubject     string
	passwordResetTitle       string
	passwordResetLead        string
	passwordResetButtonText  string

	// Legacy raw templates. Empty means use built-in branded templates.
	emailVerificationHTMLTmpl string
	passwordResetHTMLTmpl     string
)

// EmailTemplateData is the variable set available to templates.
type EmailTemplateData struct {
	SystemName   string
	BrandName    string
	LogoURL      string
	PrimaryColor string
	FooterText   string
	Eyebrow      string
	Title        string
	Lead         string
	ButtonText   string
	Disclaimer   string
	Code         string
	ValidMinutes int
	ResetLink    string
	Year         int
}

// EmailBrandConfig is the structured brand/copy config for auth emails.
type EmailBrandConfig struct {
	BrandName         string `json:"brand_name"`
	LogoURL           string `json:"logo_url"`
	PrimaryColor      string `json:"primary_color"`
	FooterText        string `json:"footer_text"`
	VerificationSubj  string `json:"verification_subject"`
	VerificationTitle string `json:"verification_title"`
	VerificationLead  string `json:"verification_lead"`
	ResetSubject      string `json:"password_reset_subject"`
	ResetTitle        string `json:"password_reset_title"`
	ResetLead         string `json:"password_reset_lead"`
	ResetButtonText   string `json:"password_reset_button_text"`
}

// SetEmailBrandConfig updates runtime brand/copy settings.
func SetEmailBrandConfig(cfg EmailBrandConfig) {
	emailTemplateMu.Lock()
	defer emailTemplateMu.Unlock()
	emailBrandName = strings.TrimSpace(cfg.BrandName)
	emailBrandLogoURL = strings.TrimSpace(cfg.LogoURL)
	emailBrandPrimaryColor = normalizePrimaryColor(cfg.PrimaryColor)
	emailBrandFooterText = strings.TrimSpace(cfg.FooterText)
	emailVerificationSubject = strings.TrimSpace(cfg.VerificationSubj)
	emailVerificationTitle = strings.TrimSpace(cfg.VerificationTitle)
	emailVerificationLead = strings.TrimSpace(cfg.VerificationLead)
	passwordResetSubject = strings.TrimSpace(cfg.ResetSubject)
	passwordResetTitle = strings.TrimSpace(cfg.ResetTitle)
	passwordResetLead = strings.TrimSpace(cfg.ResetLead)
	passwordResetButtonText = strings.TrimSpace(cfg.ResetButtonText)
}

// GetEmailBrandConfig returns currently configured brand/copy settings.
func GetEmailBrandConfig() EmailBrandConfig {
	emailTemplateMu.RLock()
	defer emailTemplateMu.RUnlock()
	return EmailBrandConfig{
		BrandName:         emailBrandName,
		LogoURL:           emailBrandLogoURL,
		PrimaryColor:      emailBrandPrimaryColor,
		FooterText:        emailBrandFooterText,
		VerificationSubj:  emailVerificationSubject,
		VerificationTitle: emailVerificationTitle,
		VerificationLead:  emailVerificationLead,
		ResetSubject:      passwordResetSubject,
		ResetTitle:        passwordResetTitle,
		ResetLead:         passwordResetLead,
		ResetButtonText:   passwordResetButtonText,
	}
}

// SetEmailTemplates updates legacy raw HTML templates and optional subjects.
// Empty HTML values fall back to built-in branded templates when rendering.
// Empty subject arguments leave the current brand subject fields unchanged
// so clearing legacy HTML does not wipe visual brand subjects.
func SetEmailTemplates(verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	emailTemplateMu.Lock()
	defer emailTemplateMu.Unlock()
	if strings.TrimSpace(verificationSubject) != "" {
		emailVerificationSubject = strings.TrimSpace(verificationSubject)
	}
	if strings.TrimSpace(resetSubject) != "" {
		passwordResetSubject = strings.TrimSpace(resetSubject)
	}
	emailVerificationHTMLTmpl = verificationHTML
	passwordResetHTMLTmpl = resetHTML
}

// GetEmailTemplates returns currently configured legacy template strings.
func GetEmailTemplates() (verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	emailTemplateMu.RLock()
	defer emailTemplateMu.RUnlock()
	return emailVerificationSubject, emailVerificationHTMLTmpl, passwordResetSubject, passwordResetHTMLTmpl
}

// DefaultEmailBrandConfig returns empty brand overrides (built-in copy/colors apply).
func DefaultEmailBrandConfig() EmailBrandConfig {
	return EmailBrandConfig{}
}

// DefaultEmailTemplates returns built-in subject/html templates for admin restore/docs.
func DefaultEmailTemplates() (verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	return defaultVerificationSubjectTemplate(),
		defaultVerificationHTMLTemplate(),
		defaultPasswordResetSubjectTemplate(),
		defaultPasswordResetHTMLTemplate()
}

// RenderVerificationEmail builds subject/body for registration email codes.
func RenderVerificationEmail(systemName, code string, validMinutes int) (subject string, htmlBody string) {
	cfg := GetEmailBrandConfig()
	data := buildEmailData("verification", systemName, code, "", validMinutes, cfg)
	subjectTmpl := firstNonEmpty(cfg.VerificationSubj, defaultVerificationSubjectTemplate())
	subject = renderTemplateOrDefault("verification-subject", subjectTmpl, defaultVerificationSubjectTemplate(), data)

	_, legacyHTML, _, _ := snapshotLegacyTemplates()
	if strings.TrimSpace(legacyHTML) != "" {
		htmlBody = renderTemplateOrDefault("verification-html", legacyHTML, defaultVerificationHTMLTemplate(), data)
	} else {
		htmlBody = renderTemplateOrDefault("verification-html", defaultVerificationHTMLTemplate(), defaultVerificationHTMLTemplate(), data)
	}
	return subject, htmlBody
}

// RenderPasswordResetEmail builds subject/body for password reset links.
func RenderPasswordResetEmail(systemName, resetLink string, validMinutes int) (subject string, htmlBody string) {
	cfg := GetEmailBrandConfig()
	data := buildEmailData("password_reset", systemName, "", resetLink, validMinutes, cfg)
	subjectTmpl := firstNonEmpty(cfg.ResetSubject, defaultPasswordResetSubjectTemplate())
	subject = renderTemplateOrDefault("reset-subject", subjectTmpl, defaultPasswordResetSubjectTemplate(), data)

	_, _, _, legacyHTML := snapshotLegacyTemplates()
	if strings.TrimSpace(legacyHTML) != "" {
		htmlBody = renderTemplateOrDefault("reset-html", legacyHTML, defaultPasswordResetHTMLTemplate(), data)
	} else {
		htmlBody = renderTemplateOrDefault("reset-html", defaultPasswordResetHTMLTemplate(), defaultPasswordResetHTMLTemplate(), data)
	}
	return subject, htmlBody
}

// PreviewEmailTemplate renders a draft with sample data.
// kind: "verification" | "password_reset"
// Draft brand fields override the currently saved config for this preview only.
func PreviewEmailTemplate(kind string, draft EmailBrandConfig) (subject string, htmlBody string, err error) {
	cfg := mergeEmailBrandConfig(GetEmailBrandConfig(), draft)
	kind = strings.TrimSpace(strings.ToLower(kind))
	switch kind {
	case "verification", "email_verification", "verify":
		data := buildEmailData("verification", SystemName, "123456", "", VerificationValidMinutes, cfg)
		subjectTmpl := firstNonEmpty(cfg.VerificationSubj, defaultVerificationSubjectTemplate())
		subject, err = executeEmailTemplate("preview-subject", subjectTmpl, data)
		if err != nil {
			return "", "", err
		}
		htmlBody, err = executeEmailTemplate("preview-html", defaultVerificationHTMLTemplate(), data)
		return subject, htmlBody, err
	case "password_reset", "reset", "password":
		data := buildEmailData(
			"password_reset",
			SystemName,
			"",
			"https://example.com/user/reset?email=demo@example.com&token=preview-token",
			VerificationValidMinutes,
			cfg,
		)
		subjectTmpl := firstNonEmpty(cfg.ResetSubject, defaultPasswordResetSubjectTemplate())
		subject, err = executeEmailTemplate("preview-subject", subjectTmpl, data)
		if err != nil {
			return "", "", err
		}
		htmlBody, err = executeEmailTemplate("preview-html", defaultPasswordResetHTMLTemplate(), data)
		return subject, htmlBody, err
	default:
		return "", "", fmt.Errorf("unknown email template kind: %s", kind)
	}
}

// ValidateEmailTemplate parses a template string with EmailTemplateData fields.
func ValidateEmailTemplate(name, tmpl string) error {
	if strings.TrimSpace(tmpl) == "" {
		return nil
	}
	_, err := template.New(name).Option("missingkey=zero").Parse(tmpl)
	return err
}

// ValidateEmailBrandField validates structured brand option values.
func ValidateEmailBrandField(key, value string) error {
	value = strings.TrimSpace(value)
	switch key {
	case OptionEmailBrandPrimaryColor:
		if value == "" {
			return nil
		}
		if !hexColorPattern.MatchString(value) {
			return fmt.Errorf("primary color must be a hex value like #1f1b16")
		}
	case OptionEmailBrandLogoURL:
		if value == "" {
			return nil
		}
		u, err := url.Parse(value)
		if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
			return fmt.Errorf("logo URL must be an absolute http(s) URL")
		}
	case OptionEmailBrandName,
		OptionEmailBrandFooterText,
		OptionEmailVerificationSubject,
		OptionEmailVerificationTitle,
		OptionEmailVerificationLead,
		OptionPasswordResetSubject,
		OptionPasswordResetTitle,
		OptionPasswordResetLead,
		OptionPasswordResetButtonText:
		if len(value) > 500 {
			return fmt.Errorf("%s is too long", key)
		}
	}
	return nil
}

func snapshotLegacyTemplates() (verificationSubject, verificationHTML, resetSubject, resetHTML string) {
	emailTemplateMu.RLock()
	defer emailTemplateMu.RUnlock()
	return emailVerificationSubject, emailVerificationHTMLTmpl, passwordResetSubject, passwordResetHTMLTmpl
}

func mergeEmailBrandConfig(base, draft EmailBrandConfig) EmailBrandConfig {
	return EmailBrandConfig{
		BrandName:         firstNonEmpty(draft.BrandName, base.BrandName),
		LogoURL:           firstNonEmpty(draft.LogoURL, base.LogoURL),
		PrimaryColor:      firstNonEmpty(draft.PrimaryColor, base.PrimaryColor),
		FooterText:        firstNonEmpty(draft.FooterText, base.FooterText),
		VerificationSubj:  firstNonEmpty(draft.VerificationSubj, base.VerificationSubj),
		VerificationTitle: firstNonEmpty(draft.VerificationTitle, base.VerificationTitle),
		VerificationLead:  firstNonEmpty(draft.VerificationLead, base.VerificationLead),
		ResetSubject:      firstNonEmpty(draft.ResetSubject, base.ResetSubject),
		ResetTitle:        firstNonEmpty(draft.ResetTitle, base.ResetTitle),
		ResetLead:         firstNonEmpty(draft.ResetLead, base.ResetLead),
		ResetButtonText:   firstNonEmpty(draft.ResetButtonText, base.ResetButtonText),
	}
}

func buildEmailData(kind, systemName, code, resetLink string, validMinutes int, cfg EmailBrandConfig) EmailTemplateData {
	brand := firstNonEmpty(cfg.BrandName, systemName, SystemName, "Origin Gateway")
	logo := strings.TrimSpace(cfg.LogoURL)
	color := normalizePrimaryColor(firstNonEmpty(cfg.PrimaryColor, BrandColor, "#1f1b16"))
	if color == "" {
		color = "#1f1b16"
	}
	footer := firstNonEmpty(cfg.FooterText, brand)

	data := EmailTemplateData{
		SystemName:   brand,
		BrandName:    brand,
		LogoURL:      logo,
		PrimaryColor: color,
		FooterText:   footer,
		Code:         code,
		ValidMinutes: validMinutes,
		ResetLink:    resetLink,
		Year:         time.Now().Year(),
	}

	switch kind {
	case "verification":
		data.Eyebrow = "邮箱验证"
		data.Title = firstNonEmpty(cfg.VerificationTitle, "确认你的邮箱地址")
		data.Lead = firstNonEmpty(
			cfg.VerificationLead,
			fmt.Sprintf("你正在注册或绑定 %s。请使用下面的验证码完成验证。", brand),
		)
		data.Disclaimer = "如果这不是你本人的操作，请忽略这封邮件。验证码仅用于完成验证，请勿转发。"
	case "password_reset":
		data.Eyebrow = "账户安全"
		data.Title = firstNonEmpty(cfg.ResetTitle, "重置你的密码")
		data.Lead = firstNonEmpty(
			cfg.ResetLead,
			fmt.Sprintf("我们收到了重置 %s 账户密码的请求。点击下方按钮继续。", brand),
		)
		data.ButtonText = firstNonEmpty(cfg.ResetButtonText, "重置密码")
		data.Disclaimer = "如果这不是你本人的操作，请忽略这封邮件。你的密码不会被更改，除非有人通过此链接完成重置。"
	}
	return data
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
			if data.Code != "" {
				return html.EscapeString(data.Code)
			}
			return html.EscapeString(data.ResetLink)
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

func normalizePrimaryColor(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	if !strings.HasPrefix(value, "#") {
		value = "#" + value
	}
	if !hexColorPattern.MatchString(value) {
		return ""
	}
	if len(value) == 4 {
		// Expand #abc -> #aabbcc
		return strings.ToLower("#" + string(value[1]) + string(value[1]) + string(value[2]) + string(value[2]) + string(value[3]) + string(value[3]))
	}
	return strings.ToLower(value)
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}

func defaultVerificationSubjectTemplate() string {
	return `{{.BrandName}} · 邮箱验证码`
}

func defaultPasswordResetSubjectTemplate() string {
	return `{{.BrandName}} · 密码重置`
}

func defaultVerificationHTMLTemplate() string {
	// Built-in visual template. Brand elements are injected via EmailTemplateData.
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{.BrandName}} 邮箱验证</title>
</head>
<body style="margin:0;padding:0;background:#f3efe8;color:#1f1b16;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3efe8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fffdf9;border:1px solid #e7e1d7;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;border-bottom:1px solid #efe9e0;">
              {{if .LogoURL}}
              <div style="margin:0 0 14px;">
                <img src="{{.LogoURL}}" alt="{{.BrandName}}" width="120" style="display:block;max-width:120px;height:auto;border:0;" />
              </div>
              {{end}}
              <p style="margin:0 0 6px;color:#7a746b;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{.Eyebrow}}</p>
              <h1 style="margin:0;font-size:22px;line-height:1.35;font-weight:600;color:{{.PrimaryColor}};font-family:Georgia,'Times New Roman',serif;">{{.Title}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <p style="margin:0 0 18px;color:#5c574f;font-size:15px;line-height:1.7;">{{.Lead}}</p>
              <p style="margin:0 0 10px;color:#7a746b;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">验证码</p>
              <div style="margin:0 0 18px;padding:18px 16px;border:1px solid #e7e1d7;border-radius:12px;background:#faf7f2;text-align:center;">
                <span style="display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:32px;line-height:1.2;letter-spacing:0.28em;font-weight:600;color:{{.PrimaryColor}};">{{.Code}}</span>
              </div>
              <p style="margin:18px 0 0;color:#7a746b;font-size:13px;line-height:1.6;">此验证码将在 <strong style="color:#1f1b16;">{{.ValidMinutes}}</strong> 分钟内有效。</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;color:#8a847b;font-size:12px;line-height:1.7;">{{.Disclaimer}}</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#9a948b;font-size:12px;line-height:1.6;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{.FooterText}}</p>
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
  <title>{{.BrandName}} 密码重置</title>
</head>
<body style="margin:0;padding:0;background:#f3efe8;color:#1f1b16;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3efe8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fffdf9;border:1px solid #e7e1d7;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;border-bottom:1px solid #efe9e0;">
              {{if .LogoURL}}
              <div style="margin:0 0 14px;">
                <img src="{{.LogoURL}}" alt="{{.BrandName}}" width="120" style="display:block;max-width:120px;height:auto;border:0;" />
              </div>
              {{end}}
              <p style="margin:0 0 6px;color:#7a746b;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{.Eyebrow}}</p>
              <h1 style="margin:0;font-size:22px;line-height:1.35;font-weight:600;color:{{.PrimaryColor}};font-family:Georgia,'Times New Roman',serif;">{{.Title}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <p style="margin:0 0 18px;color:#5c574f;font-size:15px;line-height:1.7;">{{.Lead}}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
                <tr>
                  <td style="border-radius:10px;background:{{.PrimaryColor}};">
                    <a href="{{.ResetLink}}" style="display:inline-block;padding:12px 18px;color:#faf7f2;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.02em;">{{.ButtonText}}</a>
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
              <p style="margin:0;color:#8a847b;font-size:12px;line-height:1.7;">{{.Disclaimer}}</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#9a948b;font-size:12px;line-height:1.6;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{.FooterText}}</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}
