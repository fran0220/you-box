package common

import (
	"fmt"
	"html"
	"strings"
)

// RenderVerificationEmail builds a clean HTML body for registration email codes.
func RenderVerificationEmail(systemName, code string, validMinutes int) (subject string, htmlBody string) {
	name := emailBrandName(systemName)
	subject = fmt.Sprintf("%s · 邮箱验证码", name)
	htmlBody = renderAuthEmail(authEmailContent{
		Brand:        name,
		Eyebrow:      "邮箱验证",
		Title:        "确认你的邮箱地址",
		Lead:         fmt.Sprintf("你正在注册或绑定 %s。请使用下面的验证码完成验证。", name),
		Code:         code,
		CodeLabel:    "验证码",
		ValidMinutes: validMinutes,
		FooterNote:   "如果这不是你本人的操作，请忽略这封邮件。验证码仅用于完成验证，请勿转发。",
	})
	return subject, htmlBody
}

// RenderPasswordResetEmail builds a clean HTML body for password reset links.
func RenderPasswordResetEmail(systemName, resetLink string, validMinutes int) (subject string, htmlBody string) {
	name := emailBrandName(systemName)
	subject = fmt.Sprintf("%s · 密码重置", name)
	safeLink := html.EscapeString(resetLink)
	htmlBody = renderAuthEmail(authEmailContent{
		Brand:       name,
		Eyebrow:     "账户安全",
		Title:       "重置你的密码",
		Lead:        fmt.Sprintf("我们收到了重置 %s 账户密码的请求。点击下方按钮继续。", name),
		ActionURL:   resetLink,
		ActionLabel: "重置密码",
		SecondaryHTML: fmt.Sprintf(
			`<p style="margin:0 0 12px;color:#5c574f;font-size:14px;line-height:1.6;">如果按钮无法点击，请复制以下链接到浏览器打开：</p>`+
				`<p style="margin:0;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.6;color:#1f1b16;">%s</p>`,
			safeLink,
		),
		ValidMinutes: validMinutes,
		FooterNote:   "如果这不是你本人的操作，请忽略这封邮件。你的密码不会被更改，除非有人通过此链接完成重置。",
	})
	return subject, htmlBody
}

type authEmailContent struct {
	Brand         string
	Eyebrow       string
	Title         string
	Lead          string
	Code          string
	CodeLabel     string
	ActionURL     string
	ActionLabel   string
	SecondaryHTML string
	ValidMinutes  int
	FooterNote    string
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

func renderAuthEmail(c authEmailContent) string {
	brand := html.EscapeString(c.Brand)
	eyebrow := html.EscapeString(c.Eyebrow)
	title := html.EscapeString(c.Title)
	lead := html.EscapeString(c.Lead)
	footer := html.EscapeString(c.FooterNote)

	var mainBlock strings.Builder
	if strings.TrimSpace(c.Code) != "" {
		code := html.EscapeString(c.Code)
		codeLabel := html.EscapeString(c.CodeLabel)
		if codeLabel == "" {
			codeLabel = "验证码"
		}
		mainBlock.WriteString(fmt.Sprintf(`
              <p style="margin:0 0 10px;color:#7a746b;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">%s</p>
              <div style="margin:0 0 18px;padding:18px 16px;border:1px solid #e7e1d7;border-radius:12px;background:#faf7f2;text-align:center;">
                <span style="display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:32px;line-height:1.2;letter-spacing:0.28em;font-weight:600;color:#1f1b16;">%s</span>
              </div>`, codeLabel, code))
	}

	if strings.TrimSpace(c.ActionURL) != "" {
		actionURL := html.EscapeString(c.ActionURL)
		actionLabel := html.EscapeString(c.ActionLabel)
		if actionLabel == "" {
			actionLabel = "继续"
		}
		mainBlock.WriteString(fmt.Sprintf(`
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
                <tr>
                  <td style="border-radius:10px;background:#1f1b16;">
                    <a href="%s" style="display:inline-block;padding:12px 18px;color:#faf7f2;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.02em;">%s</a>
                  </td>
                </tr>
              </table>`, actionURL, actionLabel))
	}

	if strings.TrimSpace(c.SecondaryHTML) != "" {
		mainBlock.WriteString(c.SecondaryHTML)
	}

	validLine := ""
	if c.ValidMinutes > 0 {
		validLine = fmt.Sprintf(
			`<p style="margin:18px 0 0;color:#7a746b;font-size:13px;line-height:1.6;">此链接或验证码将在 <strong style="color:#1f1b16;">%d</strong> 分钟内有效。</p>`,
			c.ValidMinutes,
		)
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>%s</title>
</head>
<body style="margin:0;padding:0;background:#f3efe8;color:#1f1b16;">
  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background:#f3efe8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fffdf9;border:1px solid #e7e1d7;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px;border-bottom:1px solid #efe9e0;">
              <p style="margin:0 0 6px;color:#7a746b;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">%s</p>
              <h1 style="margin:0;font-size:22px;line-height:1.35;font-weight:600;color:#1f1b16;font-family:Georgia,'Times New Roman',serif;">%s</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <p style="margin:0 0 18px;color:#5c574f;font-size:15px;line-height:1.7;">%s</p>
              %s
              %s
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;color:#8a847b;font-size:12px;line-height:1.7;">%s</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#9a948b;font-size:12px;line-height:1.6;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">%s</p>
      </td>
    </tr>
  </table>
</body>
</html>`, title, eyebrow, title, lead, mainBlock.String(), validLine, footer, brand)
}
