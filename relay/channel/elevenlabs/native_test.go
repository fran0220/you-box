package elevenlabs

import (
	"net/http"
	"testing"
)

func TestDefaultModelListUsesCurrentPublicModels(t *testing.T) {
	models := map[string]bool{}
	for _, model := range DefaultModelList {
		models[model] = true
	}

	for _, model := range []string{
		"eleven_v3",
		"scribe_v2",
		"eleven_multilingual_sts_v2",
		"eleven_text_to_sound_v2",
		"music_v2",
		"elevenlabs-audio-isolation",
		"elevenlabs-forced-alignment",
	} {
		if !models[model] {
			t.Fatalf("DefaultModelList missing %s", model)
		}
	}
	for _, model := range []string{
		"tts-1",
		"whisper-1",
		"eleven_flash_v2_5",
		"eleven_multilingual_v1",
		"scribe_v1",
		"elevenlabs-sound-generation",
		"elevenlabs-text-to-dialogue",
	} {
		if models[model] {
			t.Fatalf("DefaultModelList should not include legacy or internal alias %s", model)
		}
	}
}

func TestNativeEndpointDefaultsUsePublicModels(t *testing.T) {
	tests := []struct {
		path string
		want string
	}{
		{path: "/v1/audio-isolation", want: NativeAudioIsolationModel},
		{path: "/v1/forced-alignment", want: NativeForcedAlignmentModel},
		{path: "/v1/sound-generation", want: NativeSoundGenerationModel},
		{path: "/v1/music/stream", want: NativeMusicModel},
		{path: "/v1/text-to-dialogue", want: DefaultTTSModel},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			endpoint, ok := MatchNativeEndpoint(http.MethodPost, tt.path)
			if !ok {
				t.Fatalf("MatchNativeEndpoint(%q) returned false", tt.path)
			}
			if endpoint.DefaultModel != tt.want {
				t.Fatalf("DefaultModel = %q, want %q", endpoint.DefaultModel, tt.want)
			}
		})
	}
}

func TestOpenAIAudioModelDoesNotTranslateProviderAliases(t *testing.T) {
	for _, tt := range []struct {
		name   string
		model  string
		speech bool
	}{
		{name: "openai tts", model: "tts-1", speech: true},
		{name: "openai hd tts", model: "tts-1-hd", speech: true},
		{name: "openai transcription", model: "whisper-1", speech: false},
		{name: "elevenlabs tts", model: DefaultTTSModel, speech: true},
		{name: "elevenlabs stt", model: DefaultSTTModel, speech: false},
	} {
		t.Run(tt.name, func(t *testing.T) {
			if got := OpenAIAudioModel(tt.model, tt.speech); got != tt.model {
				t.Fatalf("OpenAIAudioModel(%q) = %q, want unchanged", tt.model, got)
			}
		})
	}

	if got := OpenAIAudioModel("", true); got != DefaultTTSModel {
		t.Fatalf("empty speech model = %q, want %q", got, DefaultTTSModel)
	}
	if got := OpenAIAudioModel("", false); got != DefaultSTTModel {
		t.Fatalf("empty transcription model = %q, want %q", got, DefaultSTTModel)
	}
}

func TestMatchNativeEndpointAllowlist(t *testing.T) {
	tests := []struct {
		name   string
		method string
		path   string
		want   bool
	}{
		{name: "models", method: http.MethodGet, path: "/v1/models", want: true},
		{name: "v2 voices", method: http.MethodGet, path: "/v2/voices", want: true},
		{name: "voice settings", method: http.MethodGet, path: "/v1/voices/voice-id/settings", want: true},
		{name: "default voice settings", method: http.MethodGet, path: "/v1/voices/settings/default", want: true},
		{name: "tts", method: http.MethodPost, path: "/v1/text-to-speech/voice-id", want: true},
		{name: "tts stream timestamps", method: http.MethodPost, path: "/v1/text-to-speech/voice-id/stream/with-timestamps", want: true},
		{name: "stt", method: http.MethodPost, path: "/v1/speech-to-text", want: true},
		{name: "music stream", method: http.MethodPost, path: "/v1/music/stream", want: true},
		{name: "text to dialogue", method: http.MethodPost, path: "/v1/text-to-dialogue", want: true},
		{name: "text to dialogue timestamps", method: http.MethodPost, path: "/v1/text-to-dialogue/with-timestamps", want: true},
		{name: "text to dialogue stream timestamps", method: http.MethodPost, path: "/v1/text-to-dialogue/stream/with-timestamps", want: true},
		{name: "history blocked", method: http.MethodGet, path: "/v1/history", want: false},
		{name: "convai blocked", method: http.MethodPost, path: "/v1/convai/agents", want: false},
		{name: "dubbing blocked", method: http.MethodPost, path: "/v1/dubbing", want: false},
		{name: "voice mutation blocked", method: http.MethodPost, path: "/v1/voices/add", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, got := MatchNativeEndpoint(tt.method, tt.path)
			if got != tt.want {
				t.Fatalf("MatchNativeEndpoint(%q, %q) = %v, want %v", tt.method, tt.path, got, tt.want)
			}
		})
	}
}

func TestUpstreamPathFromProxyPath(t *testing.T) {
	got := UpstreamPathFromProxyPath("/elevenlabs/v1/models")
	if got != "/v1/models" {
		t.Fatalf("got %q, want /v1/models", got)
	}
}
