package meshy

import (
	"net/http"
	"testing"
)

func TestDefaultModelListUsesMeshyWorkflowModels(t *testing.T) {
	models := map[string]bool{}
	for _, model := range DefaultModelList {
		models[model] = true
	}
	for _, model := range []string{
		ModelTextTo3D,
		ModelImageTo3D,
		ModelMultiImageTo3D,
		ModelRemesh,
		ModelConvert,
		ModelResize,
		ModelRetexture,
		ModelRigging,
		ModelAnimation,
		ModelUVUnwrap,
	} {
		if !models[model] {
			t.Fatalf("DefaultModelList missing %s", model)
		}
	}
	for _, model := range []string{"meshy-5", "meshy-6", "latest"} {
		if models[model] {
			t.Fatalf("DefaultModelList should expose workflow models, not ai_model parameter %s", model)
		}
	}
}

func TestMatchNativeEndpointAllowlist(t *testing.T) {
	tests := []struct {
		name   string
		method string
		path   string
		model  string
		want   bool
	}{
		{name: "text to 3d create", method: http.MethodPost, path: "/openapi/v2/text-to-3d", model: ModelTextTo3D, want: true},
		{name: "text to 3d stream", method: http.MethodGet, path: "/openapi/v2/text-to-3d/task-id/stream", model: ModelTextTo3D, want: true},
		{name: "image to 3d create", method: http.MethodPost, path: "/openapi/v1/image-to-3d", model: ModelImageTo3D, want: true},
		{name: "multi image to 3d create", method: http.MethodPost, path: "/openapi/v1/multi-image-to-3d", model: ModelMultiImageTo3D, want: true},
		{name: "remesh create", method: http.MethodPost, path: "/openapi/v1/remesh", model: ModelRemesh, want: true},
		{name: "convert create", method: http.MethodPost, path: "/openapi/v1/convert", model: ModelConvert, want: true},
		{name: "resize create", method: http.MethodPost, path: "/openapi/v1/resize", model: ModelResize, want: true},
		{name: "retexture create", method: http.MethodPost, path: "/openapi/v1/retexture", model: ModelRetexture, want: true},
		{name: "rigging create", method: http.MethodPost, path: "/openapi/v1/rigging", model: ModelRigging, want: true},
		{name: "animation create", method: http.MethodPost, path: "/openapi/v1/animations", model: ModelAnimation, want: true},
		{name: "uv unwrap create", method: http.MethodPost, path: "/openapi/v1/uv-unwrap", model: ModelUVUnwrap, want: true},
		{name: "uv unwrap fetch", method: http.MethodGet, path: "/openapi/v1/uv-unwrap/task-id", model: ModelUVUnwrap, want: true},
		{name: "uv unwrap stream", method: http.MethodGet, path: "/openapi/v1/uv-unwrap/task-id/stream", model: ModelUVUnwrap, want: true},
		{name: "balance", method: http.MethodGet, path: "/openapi/v1/balance", model: ModelTextTo3D, want: true},
		{name: "balance wrong version", method: http.MethodGet, path: "/openapi/v2/balance", want: false},
		{name: "wrong text version", method: http.MethodPost, path: "/openapi/v1/text-to-3d", want: false},
		{name: "unknown account api", method: http.MethodPost, path: "/openapi/v1/api-keys", want: false},
		{name: "print api excluded", method: http.MethodPost, path: "/openapi/v1/multi-color-print", want: false},
		{name: "creative lab excluded", method: http.MethodPost, path: "/openapi/creative-lab/keychain/v1/prototype", want: false},
		{name: "text to image excluded", method: http.MethodPost, path: "/openapi/v1/text-to-image", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			endpoint, got := MatchNativeEndpoint(tt.method, tt.path)
			if got != tt.want {
				t.Fatalf("MatchNativeEndpoint(%q) = %v, want %v", tt.path, got, tt.want)
			}
			if tt.want && endpoint.DefaultModel != tt.model {
				t.Fatalf("DefaultModel = %q, want %q", endpoint.DefaultModel, tt.model)
			}
		})
	}
}

func TestUpstreamPathFromProxyPath(t *testing.T) {
	got := UpstreamPathFromProxyPath("/meshy/openapi/v2/text-to-3d")
	if got != "/openapi/v2/text-to-3d" {
		t.Fatalf("got %q, want /openapi/v2/text-to-3d", got)
	}
}

func TestGatewayTaskIDFromPath(t *testing.T) {
	tests := []struct {
		path string
		want string
	}{
		{path: "/meshy/tasks/018a210d-8ba4", want: "018a210d-8ba4"},
		{path: "/meshy/tasks/018a210d-8ba4/", want: "018a210d-8ba4"},
		{path: "/meshy/tasks", want: ""},
		{path: "/meshy/tasks/a/b", want: ""},
		{path: "/meshy/openapi/v2/text-to-3d/task-id", want: ""},
	}
	for _, tt := range tests {
		if got := GatewayTaskIDFromPath(tt.path); got != tt.want {
			t.Fatalf("GatewayTaskIDFromPath(%q) = %q, want %q", tt.path, got, tt.want)
		}
	}
}

func TestUpstreamTaskPath(t *testing.T) {
	tests := []struct {
		resource string
		taskID   string
		want     string
		ok       bool
	}{
		{resource: "text-to-3d", taskID: "abc", want: "/openapi/v2/text-to-3d/abc", ok: true},
		{resource: "uv-unwrap", taskID: "abc", want: "/openapi/v1/uv-unwrap/abc", ok: true},
		{resource: "animations", taskID: "abc", want: "/openapi/v1/animations/abc", ok: true},
		{resource: "balance", taskID: "abc", ok: false},
		{resource: "text-to-3d", taskID: "", ok: false},
	}
	for _, tt := range tests {
		got, ok := UpstreamTaskPath(tt.resource, tt.taskID)
		if ok != tt.ok || (ok && got != tt.want) {
			t.Fatalf("UpstreamTaskPath(%q, %q) = (%q, %v), want (%q, %v)", tt.resource, tt.taskID, got, ok, tt.want, tt.ok)
		}
	}
}

func TestParseCreateTaskID(t *testing.T) {
	if id, ok := ParseCreateTaskID([]byte(`{"result":"018a210d-8ba4"}`)); !ok || id != "018a210d-8ba4" {
		t.Fatalf("ParseCreateTaskID = (%q, %v), want (018a210d-8ba4, true)", id, ok)
	}
	if _, ok := ParseCreateTaskID([]byte(`{"message":"error"}`)); ok {
		t.Fatal("ParseCreateTaskID should fail without result field")
	}
	if _, ok := ParseCreateTaskID([]byte(`not-json`)); ok {
		t.Fatal("ParseCreateTaskID should fail on invalid JSON")
	}
}
