package common

import (
	"strings"
	"testing"
)

func TestRenderVerificationEmailIncludesCodeAndBrand(t *testing.T) {
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

func TestRenderPasswordResetEmailUsesCustomTemplate(t *testing.T) {
	SetEmailTemplates(
		"",
		"",
		"Reset {{.SystemName}}",
		`<p>{{.SystemName}}</p><a href="{{.ResetLink}}">go</a><span>{{.ValidMinutes}}</span>`,
	)
	t.Cleanup(func() { SetEmailTemplates("", "", "", "") })

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
	SetEmailTemplates("{{.SystemName", "<p>{{.Code}}</p>", "", "")
	t.Cleanup(func() { SetEmailTemplates("", "", "", "") })

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

func TestPreviewEmailTemplate(t *testing.T) {
	subject, body, err := PreviewEmailTemplate("verification", "", "")
	if err != nil {
		t.Fatalf("preview failed: %v", err)
	}
	if !strings.Contains(subject, "邮箱验证码") && !strings.Contains(body, "123456") {
		t.Fatalf("preview should render sample verification content")
	}
}
