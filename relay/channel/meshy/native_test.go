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
		{name: "balance", method: http.MethodGet, path: "/openapi/v2/balance", model: ModelTextTo3D, want: true},
		{name: "wrong text version", method: http.MethodPost, path: "/openapi/v1/text-to-3d", want: false},
		{name: "unknown account api", method: http.MethodPost, path: "/openapi/v1/api-keys", want: false},
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
