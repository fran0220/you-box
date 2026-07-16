package meshy

import (
	"testing"

	"github.com/QuantumNous/new-api/model"
)

func TestParseUpstreamTaskInfoStatuses(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus model.TaskStatus
		wantURL    string
		wantReason string
		wantProg   string
	}{
		{
			name:       "pending",
			body:       `{"id":"t1","status":"PENDING","progress":0}`,
			wantStatus: model.TaskStatusQueued,
		},
		{
			name:       "in progress with percent",
			body:       `{"id":"t1","status":"IN_PROGRESS","progress":42}`,
			wantStatus: model.TaskStatusInProgress,
			wantProg:   "42%",
		},
		{
			name:       "succeeded prefers glb",
			body:       `{"id":"t1","status":"SUCCEEDED","progress":100,"model_urls":{"fbx":"https://x/model.fbx","glb":"https://x/model.glb"}}`,
			wantStatus: model.TaskStatusSuccess,
			wantURL:    "https://x/model.glb",
		},
		{
			name:       "failed with reason",
			body:       `{"id":"t1","status":"FAILED","task_error":{"message":"boom"}}`,
			wantStatus: model.TaskStatusFailure,
			wantReason: "boom",
		},
		{
			name:       "canceled maps to failure",
			body:       `{"id":"t1","status":"CANCELED"}`,
			wantStatus: model.TaskStatusFailure,
			wantReason: "task canceled",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			info, err := ParseUpstreamTaskInfo([]byte(tt.body))
			if err != nil {
				t.Fatalf("ParseUpstreamTaskInfo error: %v", err)
			}
			if info.TaskID != "t1" {
				t.Fatalf("TaskID = %q, want t1", info.TaskID)
			}
			if model.TaskStatus(info.Status) != tt.wantStatus {
				t.Fatalf("Status = %q, want %q", info.Status, tt.wantStatus)
			}
			if info.Url != tt.wantURL {
				t.Fatalf("Url = %q, want %q", info.Url, tt.wantURL)
			}
			if info.Reason != tt.wantReason {
				t.Fatalf("Reason = %q, want %q", info.Reason, tt.wantReason)
			}
			if info.Progress != tt.wantProg {
				t.Fatalf("Progress = %q, want %q", info.Progress, tt.wantProg)
			}
		})
	}
}

func TestParseUpstreamTaskInfoInvalid(t *testing.T) {
	if _, err := ParseUpstreamTaskInfo([]byte("not-json")); err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}
