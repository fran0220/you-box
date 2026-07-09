package common

import (
	"strings"
	"testing"
)

func TestRenderVerificationEmailIncludesCodeAndBrand(t *testing.T) {
	SetEmailBrandConfig(EmailBrandConfig{})
	SetEmailTemplates("", "", "", "")
	subject, body := RenderVerificationEmail("YouBox", "123456", 10)

	if !strings.Contains(subject, "YouBox") {
		t.Fatalf("subject should contain brand, got %q", subject)
	}
	if !strings.Contains(body, "123456") {
		t.Fatalf("body should contain verification code")
	}
	if !strings.Contains(body, "10") {
		t.Fatalf("body should mention validity minutes")
	}
	if !strings.Contains(body, "邮箱验证") {
		t.Fatalf("body should include verification eyebrow")
	}
	if strings.Contains(body, "<script") {
		t.Fatalf("body must not include scripts")
	}
}

func TestRenderPasswordResetEmailUsesBrandFields(t *testing.T) {
	SetEmailBrandConfig(EmailBrandConfig{
		BrandName:       "Origin",
		PrimaryColor:    "#112233",
		ResetSubject:    "Reset {{.BrandName}}",
		ResetTitle:      "改密确认",
		ResetButtonText: "立即重置",
		FooterText:      "Origin Security",
	})
	SetEmailTemplates("", "", "", "")
	t.Cleanup(func() {
		SetEmailBrandConfig(EmailBrandConfig{})
		SetEmailTemplates("", "", "", "")
	})

	subject, body := RenderPasswordResetEmail("YouBox", "https://example.com/reset?x=1", 15)
	if subject != "Reset Origin" {
		t.Fatalf("unexpected subject: %q", subject)
	}
	if !strings.Contains(body, "https://example.com/reset?x=1") {
		t.Fatalf("body should include reset link")
	}
	if !strings.Contains(body, "15") {
		t.Fatalf("body should include valid minutes")
	}
	if !strings.Contains(body, "改密确认") {
		t.Fatalf("body should use custom title")
	}
	if !strings.Contains(body, "立即重置") {
		t.Fatalf("body should use custom button text")
	}
	if !strings.Contains(body, "#112233") {
		t.Fatalf("body should use custom primary color")
	}
	if !strings.Contains(body, "Origin Security") {
		t.Fatalf("body should use custom footer")
	}
}

func TestRenderPasswordResetEmailUsesCustomTemplate(t *testing.T) {
	SetEmailBrandConfig(EmailBrandConfig{})
	SetEmailTemplates(
		"",
		"",
		"Reset {{.SystemName}}",
		`<p>{{.SystemName}}</p><a href="{{.ResetLink}}">go</a><span>{{.ValidMinutes}}</span>`,
	)
	t.Cleanup(func() {
		SetEmailBrandConfig(EmailBrandConfig{})
		SetEmailTemplates("", "", "", "")
	})

	subject, body := RenderPasswordResetEmail("YouBox", "https://example.com/reset?x=1", 15)
	if subject != "Reset YouBox" {
		t.Fatalf("unexpected subject: %q", subject)
	}
	if !strings.Contains(body, "https://example.com/reset?x=1") {
		t.Fatalf("body should include reset link")
	}
	if !strings.Contains(body, "15") {
		t.Fatalf("body should include valid minutes")
	}
}

func TestRenderVerificationFallsBackOnBadTemplate(t *testing.T) {
	SetEmailBrandConfig(EmailBrandConfig{})
	SetEmailTemplates("{{.SystemName", "<p>{{.Code}}</p>", "", "")
	t.Cleanup(func() {
		SetEmailBrandConfig(EmailBrandConfig{})
		SetEmailTemplates("", "", "", "")
	})

	subject, body := RenderVerificationEmail("YouBox", "654321", 5)
	if !strings.Contains(subject, "YouBox") {
		t.Fatalf("fallback subject should still work, got %q", subject)
	}
	if !strings.Contains(body, "654321") {
		t.Fatalf("fallback/default body should still include code")
	}
}

func TestValidateEmailTemplate(t *testing.T) {
	if err := ValidateEmailTemplate("ok", "Hello {{.SystemName}}"); err != nil {
		t.Fatalf("valid template rejected: %v", err)
	}
	if err := ValidateEmailTemplate("bad", "{{.SystemName"); err == nil {
		t.Fatalf("invalid template should fail")
	}
}

func TestValidateEmailBrandField(t *testing.T) {
	if err := ValidateEmailBrandField(OptionEmailBrandPrimaryColor, "#abc"); err != nil {
		t.Fatalf("short hex should pass: %v", err)
	}
	if err := ValidateEmailBrandField(OptionEmailBrandPrimaryColor, "red"); err == nil {
		t.Fatalf("named color should fail")
	}
	if err := ValidateEmailBrandField(OptionEmailBrandLogoURL, "https://cdn.example.com/logo.png"); err != nil {
		t.Fatalf("https logo should pass: %v", err)
	}
	if err := ValidateEmailBrandField(OptionEmailBrandLogoURL, "/relative.png"); err == nil {
		t.Fatalf("relative logo should fail")
	}
}

func TestPreviewEmailTemplate(t *testing.T) {
	SetEmailBrandConfig(EmailBrandConfig{BrandName: "PreviewBrand"})
	t.Cleanup(func() { SetEmailBrandConfig(EmailBrandConfig{}) })

	subject, body, err := PreviewEmailTemplate("verification", EmailBrandConfig{})
	if err != nil {
		t.Fatalf("preview failed: %v", err)
	}
	if !strings.Contains(subject, "PreviewBrand") && !strings.Contains(body, "123456") {
		t.Fatalf("preview should render sample verification content")
	}
	if !strings.Contains(body, "确认你的邮箱地址") {
		t.Fatalf("preview should use built-in title")
	}
}

func TestPreviewEmailTemplateDraftOverrides(t *testing.T) {
	SetEmailBrandConfig(EmailBrandConfig{BrandName: "Saved"})
	t.Cleanup(func() { SetEmailBrandConfig(EmailBrandConfig{}) })

	subject, body, err := PreviewEmailTemplate("password_reset", EmailBrandConfig{
		BrandName:       "Draft",
		ResetButtonText: "Go Reset",
		PrimaryColor:    "#ff00aa",
	})
	if err != nil {
		t.Fatalf("preview failed: %v", err)
	}
	if !strings.Contains(subject, "Draft") {
		t.Fatalf("draft brand should win in subject, got %q", subject)
	}
	if !strings.Contains(body, "Go Reset") {
		t.Fatalf("draft button text should appear")
	}
	if !strings.Contains(body, "#ff00aa") {
		t.Fatalf("draft color should appear")
	}
}
