package meshy

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/model"
	taskcommon "github.com/QuantumNous/new-api/relay/channel/task/taskcommon"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/service"

	"github.com/gin-gonic/gin"
)

// UpstreamTask 是 Meshy 任务对象的最小解析结构，
// 同时用于轮询 GET 响应和 webhook 回调载荷。
type UpstreamTask struct {
	ID        string            `json:"id"`
	Status    string            `json:"status"`
	Progress  int               `json:"progress"`
	ModelUrls map[string]string `json:"model_urls"`
	TaskError *struct {
		Message string `json:"message"`
	} `json:"task_error"`
}

// ResultURL 返回优先级最高的模型下载地址（GLB 优先）。
func (t *UpstreamTask) ResultURL() string {
	if len(t.ModelUrls) == 0 {
		return ""
	}
	for _, format := range []string{"glb", "fbx", "obj", "usdz", "stl"} {
		if u := strings.TrimSpace(t.ModelUrls[format]); u != "" {
			return u
		}
	}
	for _, u := range t.ModelUrls {
		if strings.TrimSpace(u) != "" {
			return u
		}
	}
	return ""
}

// ParseUpstreamTaskInfo 将 Meshy 任务对象（轮询响应或 webhook 载荷）
// 映射为通用 TaskInfo。
func ParseUpstreamTaskInfo(body []byte) (*relaycommon.TaskInfo, error) {
	task := UpstreamTask{}
	if err := common.Unmarshal(body, &task); err != nil {
		return nil, fmt.Errorf("unmarshal Meshy task failed: %w", err)
	}
	info := &relaycommon.TaskInfo{TaskID: task.ID}
	switch strings.ToUpper(strings.TrimSpace(task.Status)) {
	case "PENDING":
		info.Status = model.TaskStatusQueued
	case "IN_PROGRESS":
		info.Status = model.TaskStatusInProgress
	case "SUCCEEDED":
		info.Status = model.TaskStatusSuccess
		info.Url = task.ResultURL()
	case "FAILED":
		info.Status = model.TaskStatusFailure
		info.Reason = meshyFailReason(task, "task failed")
	case "CANCELED":
		info.Status = model.TaskStatusFailure
		info.Reason = meshyFailReason(task, "task canceled")
	}
	if task.Progress > 0 && task.Progress < 100 {
		info.Progress = fmt.Sprintf("%d%%", task.Progress)
	}
	return info, nil
}

func meshyFailReason(task UpstreamTask, fallback string) string {
	if task.TaskError != nil && strings.TrimSpace(task.TaskError.Message) != "" {
		return task.TaskError.Message
	}
	return fallback
}

// TaskAdaptor 仅用于任务进度轮询兜底（webhook 丢事件时），
// 提交仍走 /meshy/openapi 原生代理。
type TaskAdaptor struct {
	taskcommon.BaseBilling
}

func (a *TaskAdaptor) Init(info *relaycommon.RelayInfo) {}

func (a *TaskAdaptor) ValidateRequestAndSetAction(c *gin.Context, info *relaycommon.RelayInfo) *dto.TaskError {
	return service.TaskErrorWrapperLocal(errors.New("meshy uses the native /meshy/openapi proxy routes"), "invalid_request", http.StatusNotFound)
}

func (a *TaskAdaptor) BuildRequestURL(info *relaycommon.RelayInfo) (string, error) {
	return "", errors.New("meshy uses the native /meshy/openapi proxy routes")
}

func (a *TaskAdaptor) BuildRequestHeader(c *gin.Context, req *http.Request, info *relaycommon.RelayInfo) error {
	return errors.New("meshy uses the native /meshy/openapi proxy routes")
}

func (a *TaskAdaptor) BuildRequestBody(c *gin.Context, info *relaycommon.RelayInfo) (io.Reader, error) {
	return nil, errors.New("meshy uses the native /meshy/openapi proxy routes")
}

func (a *TaskAdaptor) DoRequest(c *gin.Context, info *relaycommon.RelayInfo, requestBody io.Reader) (*http.Response, error) {
	return nil, errors.New("meshy uses the native /meshy/openapi proxy routes")
}

func (a *TaskAdaptor) DoResponse(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (string, []byte, *dto.TaskError) {
	return "", nil, service.TaskErrorWrapperLocal(errors.New("meshy uses the native /meshy/openapi proxy routes"), "invalid_request", http.StatusNotFound)
}

func (a *TaskAdaptor) FetchTask(baseUrl, key string, body map[string]any, proxy string) (*http.Response, error) {
	taskID, _ := body["task_id"].(string)
	action, _ := body["action"].(string)
	taskPath, ok := UpstreamTaskPath(action, taskID)
	if !ok {
		return nil, fmt.Errorf("invalid Meshy task fetch params: action=%q task_id=%q", action, taskID)
	}
	if strings.TrimSpace(baseUrl) == "" {
		baseUrl = constant.ChannelBaseURLs[constant.ChannelTypeMeshy]
	}
	req, err := http.NewRequest(http.MethodGet, strings.TrimRight(baseUrl, "/")+taskPath, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+key)
	client, err := service.GetHttpClientWithProxy(proxy)
	if err != nil {
		return nil, fmt.Errorf("new proxy http client failed: %w", err)
	}
	return client.Do(req)
}

func (a *TaskAdaptor) ParseTaskResult(respBody []byte) (*relaycommon.TaskInfo, error) {
	return ParseUpstreamTaskInfo(respBody)
}

func (a *TaskAdaptor) GetModelList() []string {
	return DefaultModelList
}

func (a *TaskAdaptor) GetChannelName() string {
	return "Meshy"
}
