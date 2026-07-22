package controller

import (
	"context"
	"crypto/subtle"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/relay/channel/meshy"
	taskcommon "github.com/QuantumNous/new-api/relay/channel/task/taskcommon"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func RelayMeshy(c *gin.Context) {
	if taskID := meshy.GatewayTaskIDFromPath(c.Request.URL.Path); taskID != "" {
		relayMeshyTaskQuery(c, taskID)
		return
	}

	requestId := c.GetString(common.RequestIdKey)
	var newAPIError *types.NewAPIError
	defer func() {
		if newAPIError == nil {
			return
		}
		logger.LogError(c, fmt.Sprintf("Meshy relay error: %s", common.LocalLogPreview(newAPIError.Error())))
		newAPIError.SetMessage(common.MessageWithRequestId(newAPIError.Error(), requestId))
		c.JSON(newAPIError.StatusCode, gin.H{"error": newAPIError.ToOpenAIError()})
	}()

	upstreamPath := meshy.UpstreamPathFromProxyPath(c.Request.URL.Path)
	endpoint, ok := meshy.MatchNativeEndpoint(c.Request.Method, upstreamPath)
	if !ok {
		newAPIError = types.NewOpenAIError(fmt.Errorf("meshy endpoint is not allowed: %s %s", c.Request.Method, upstreamPath), types.ErrorCodeInvalidRequest, http.StatusNotFound)
		return
	}

	relayInfo, err := relaycommon.GenRelayInfo(c, types.RelayFormatOpenAI, &dto.BaseRequest{}, nil)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeGenRelayInfoFailed)
		return
	}
	relayInfo.InitChannelMeta(c)
	relayInfo.IsStream = endpoint.Stream

	usage := meshy.EstimateNativeUsage(endpoint, relayInfo.OriginModelName)
	priceData, quota, err := meshy.NativeQuota(c, relayInfo, usage)
	if err != nil {
		newAPIError = types.NewError(err, types.ErrorCodeModelPriceError, types.ErrOptionWithStatusCode(http.StatusBadRequest))
		return
	}

	preConsumed := false
	if quota > 0 && !priceData.FreeModel {
		newAPIError = service.PreConsumeBilling(c, quota, relayInfo)
		if newAPIError != nil {
			return
		}
		preConsumed = true
	}

	succeeded := false
	defer func() {
		if succeeded || !preConsumed || relayInfo.Billing == nil {
			return
		}
		relayInfo.Billing.Refund(c)
	}()

	resp, err := meshy.NativeProxy(c, relayInfo, upstreamPath)
	if err != nil {
		newAPIError = types.NewOpenAIError(err, types.ErrorCodeDoRequestFailed, http.StatusInternalServerError)
		return
	}
	statusCode := resp.StatusCode

	var responseBody []byte
	var copyErr error
	if endpoint.TaskCreate {
		responseBody, copyErr = meshy.CopyNativeResponseCapture(c, resp)
	} else {
		copyErr = meshy.CopyNativeResponse(c, resp)
	}
	if copyErr != nil {
		newAPIError = types.NewOpenAIError(copyErr, types.ErrorCodeReadResponseBodyFailed, http.StatusInternalServerError)
		return
	}
	if statusCode < http.StatusOK || statusCode >= http.StatusBadRequest {
		return
	}

	succeeded = true
	meshy.RecordNativeConsume(c, relayInfo, usage, quota, priceData)
	if endpoint.TaskCreate {
		insertMeshyTask(c, relayInfo, endpoint, usage, quota, responseBody)
	}
}

// insertMeshyTask 在创建任务成功后落库，供 webhook / 轮询更新任务进度，
// 以及 GET /meshy/tasks/:id 本地查询。
func insertMeshyTask(c *gin.Context, relayInfo *relaycommon.RelayInfo, endpoint *meshy.NativeEndpoint, usage meshy.NativeUsage, quota int, responseBody []byte) {
	upstreamID, ok := meshy.ParseCreateTaskID(responseBody)
	if !ok {
		logger.LogError(c, "Meshy create response missing task id, skip task insert: "+common.LocalLogPreview(string(responseBody)))
		return
	}
	task := model.InitTask(constant.TaskPlatformMeshy, relayInfo)
	task.TaskID = upstreamID
	task.Status = model.TaskStatusSubmitted
	task.Action = endpoint.Name
	task.Quota = quota
	task.Data = responseBody
	task.PrivateData.UpstreamTaskID = upstreamID
	task.PrivateData.BillingSource = relayInfo.BillingSource
	task.PrivateData.SubscriptionId = relayInfo.SubscriptionId
	task.PrivateData.TokenId = relayInfo.TokenId
	task.PrivateData.NodeName = common.NodeName
	task.PrivateData.BillingContext = &model.TaskBillingContext{
		ModelPrice:      relayInfo.PriceData.ModelPrice,
		GroupRatio:      relayInfo.PriceData.GroupRatioInfo.GroupRatio,
		ModelRatio:      relayInfo.PriceData.ModelRatio,
		OriginModelName: usage.ModelName,
		PerCallBilling:  true,
	}
	if err := task.Insert(); err != nil {
		logger.LogError(c, "insert Meshy task error: "+err.Error())
	}
}

// relayMeshyTaskQuery 从网关数据库返回任务状态，不透传上游，
// 避免 Origin 轮询消耗 Meshy 上游配额。
func relayMeshyTaskQuery(c *gin.Context, taskID string) {
	userId := c.GetInt("id")
	task, exist, err := model.GetByTaskId(userId, taskID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": gin.H{"message": "query task failed", "type": "internal_error"}})
		return
	}
	if !exist || task.Platform != constant.TaskPlatformMeshy {
		c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"message": "task not found", "type": "invalid_request_error"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"task_id":     task.TaskID,
		"platform":    task.Platform,
		"action":      task.Action,
		"status":      task.Status,
		"progress":    task.Progress,
		"fail_reason": task.FailReason,
		"result_url":  task.GetResultURL(),
		"submit_time": task.SubmitTime,
		"start_time":  task.StartTime,
		"finish_time": task.FinishTime,
		"data":        task.Data,
	})
}

const meshyWebhookSecretEnv = "MESHY_WEBHOOK_SECRET"

// maxMeshyWebhookBodyBytes 限制 webhook 载荷大小（任务对象 JSON，正常几 KB）。
const maxMeshyWebhookBodyBytes = 1 << 20

// RelayMeshyWebhook 接收 Meshy 任务状态回调（在 Meshy 控制台配置
// https://<gateway>/meshy-webhook/<MESHY_WEBHOOK_SECRET>），
// 更新本地任务并在失败时退款。未配置密钥时端点关闭。
func RelayMeshyWebhook(c *gin.Context) {
	secret := common.GetEnvOrDefaultString(meshyWebhookSecretEnv, "")
	if secret == "" || subtle.ConstantTimeCompare([]byte(c.Param("secret")), []byte(secret)) != 1 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Not found"})
		return
	}
	body, err := io.ReadAll(io.LimitReader(c.Request.Body, maxMeshyWebhookBodyBytes))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "read body failed"})
		return
	}
	taskInfo, err := meshy.ParseUpstreamTaskInfo(body)
	if err != nil || taskInfo.TaskID == "" {
		// 载荷无法识别也返回 200，避免 Meshy 连续投递失败后自动禁用 webhook
		logger.LogWarn(c, "Meshy webhook payload unrecognized: "+common.LocalLogPreview(string(body)))
		c.Status(http.StatusOK)
		return
	}
	applyMeshyTaskUpdate(c.Request.Context(), taskInfo, body)
	c.Status(http.StatusOK)
}

// applyMeshyTaskUpdate 将上游任务状态（webhook 载荷）合并到本地任务，
// 终态使用 CAS 更新以避免与轮询兜底重复结算，失败时退款。
func applyMeshyTaskUpdate(ctx context.Context, taskInfo *relaycommon.TaskInfo, payload []byte) {
	task, exist, err := model.GetByOnlyTaskId(taskInfo.TaskID)
	if err != nil {
		logger.LogError(ctx, fmt.Sprintf("Meshy webhook: query task %s failed: %s", taskInfo.TaskID, err.Error()))
		return
	}
	if !exist || task.Platform != constant.TaskPlatformMeshy {
		logger.LogWarn(ctx, fmt.Sprintf("Meshy webhook: task %s not found, skip", taskInfo.TaskID))
		return
	}
	if task.Status == model.TaskStatusSuccess || task.Status == model.TaskStatusFailure {
		return
	}

	oldStatus := task.Status
	now := time.Now().Unix()
	if taskInfo.Status != "" {
		task.Status = model.TaskStatus(taskInfo.Status)
	}
	task.Data = payload

	switch task.Status {
	case model.TaskStatusQueued:
		task.Progress = taskcommon.ProgressQueued
	case model.TaskStatusInProgress:
		task.Progress = taskcommon.ProgressInProgress
		if task.StartTime == 0 {
			task.StartTime = now
		}
	case model.TaskStatusSuccess:
		task.Progress = taskcommon.ProgressComplete
		if task.FinishTime == 0 {
			task.FinishTime = now
		}
		if taskInfo.Url != "" {
			task.PrivateData.ResultURL = taskInfo.Url
		}
	case model.TaskStatusFailure:
		task.Progress = taskcommon.ProgressComplete
		if task.FinishTime == 0 {
			task.FinishTime = now
		}
		task.FailReason = taskInfo.Reason
	}
	if taskInfo.Progress != "" {
		task.Progress = taskInfo.Progress
	}

	won, err := task.UpdateWithStatus(oldStatus)
	if err != nil {
		logger.LogError(ctx, fmt.Sprintf("Meshy webhook: update task %s failed: %s", task.TaskID, err.Error()))
		return
	}
	if !won {
		logger.LogInfo(ctx, fmt.Sprintf("Meshy webhook: task %s already transitioned, skip", task.TaskID))
		return
	}
	if task.Status == model.TaskStatusFailure && task.Quota != 0 {
		service.RefundTaskQuota(ctx, task, task.FailReason)
	}
}
