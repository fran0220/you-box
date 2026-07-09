package common

import (
	"strings"
	"testing"
)

func TestRenderVerificationEmailIncludesCodeAndBrand(t *testing.T) {
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

func TestRenderPasswordResetEmailEscapesLinkAndRendersButton(t *testing.T) {
	link := "https://api.origingame.dev/user/reset?email=a@b.com&token=abc<>\"'"
	subject, body := RenderPasswordResetEmail("YouBox", link, 15)

	if !strings.Contains(subject, "密码重置") {
		t.Fatalf("subject should mention password reset, got %q", subject)
	}
	if !strings.Contains(body, "重置密码") {
		t.Fatalf("body should include action label")
	}
	if strings.Contains(body, "<>") {
		t.Fatalf("raw angle brackets must be escaped in body")
	}
	if !strings.Contains(body, "https://api.origingame.dev/user/reset?email=a@b.com&amp;token=abc&lt;&gt;&#34;&#39;") &&
		!strings.Contains(body, "token=abc&lt;&gt;") {
		t.Fatalf("body should include escaped reset link, body=%s", body)
	}
}

func TestEmailBrandNameFallback(t *testing.T) {
	if got := emailBrandName("  "); got == "" {
		t.Fatalf("brand fallback must not be empty")
	}
}
