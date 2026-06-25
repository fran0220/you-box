package appusage

import "testing"

// resetHot clears the in-memory accumulator so each test starts clean.
func resetHot() {
	mu.Lock()
	hot = map[aggKey]*counters{}
	mu.Unlock()
}

func sumHot() (requests int64, tokens int64) {
	mu.Lock()
	defer mu.Unlock()
	for _, c := range hot {
		requests += c.requests
		tokens += c.tokens
	}
	return
}

// TestRecordFromHeadersCanonicalCase ensures attribution is recorded when the
// caller passes Go's canonical MIME header keys (the real-world path, since
// cloneRequestHeaders never lowercases). Previously these lookups all missed
// and the leaderboard stayed empty.
func TestRecordFromHeadersCanonicalCase(t *testing.T) {
	resetHot()
	RecordFromHeaders(map[string]string{"X-Title": "MyApp"}, "gpt-4o", 100)
	if req, tok := sumHot(); req != 1 || tok != 100 {
		t.Fatalf("X-Title not recorded: requests=%d tokens=%d", req, tok)
	}

	resetHot()
	RecordFromHeaders(map[string]string{"Http-Referer": "https://example.com/chat"}, "gpt-4o", 50)
	if req, tok := sumHot(); req != 1 || tok != 50 {
		t.Fatalf("Http-Referer not recorded: requests=%d tokens=%d", req, tok)
	}
}

// TestRecordFromHeadersLowercaseStillWorks guards against regressing callers
// that already pass lowercased keys.
func TestRecordFromHeadersLowercaseStillWorks(t *testing.T) {
	resetHot()
	RecordFromHeaders(map[string]string{"x-title": "LowerApp"}, "gpt-4o", 10)
	if req, tok := sumHot(); req != 1 || tok != 10 {
		t.Fatalf("lowercase x-title not recorded: requests=%d tokens=%d", req, tok)
	}

	resetHot()
	RecordFromHeaders(map[string]string{"http-referer": "https://example.org/"}, "gpt-4o", 5)
	if req, tok := sumHot(); req != 1 || tok != 5 {
		t.Fatalf("lowercase http-referer not recorded: requests=%d tokens=%d", req, tok)
	}
}

// TestRecordFromHeadersNoAttribution confirms requests without attribution
// headers are not recorded.
func TestRecordFromHeadersNoAttribution(t *testing.T) {
	resetHot()
	RecordFromHeaders(map[string]string{"Authorization": "Bearer sk-x"}, "gpt-4o", 100)
	if req, tok := sumHot(); req != 0 || tok != 0 {
		t.Fatalf("expected no record without attribution: requests=%d tokens=%d", req, tok)
	}
}
