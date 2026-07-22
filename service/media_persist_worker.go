package service

import (
	"context"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

// MediaPersistJob describes a best-effort R2 upload after generation.
type MediaPersistJob struct {
	UserId    int
	TaskId    string
	Kind      string
	SourceURL string
	MimeType  string
}

var (
	mediaPersistOnce  sync.Once
	mediaPersistCh    chan MediaPersistJob
	mediaJanitorOnce  sync.Once
	mediaPersistQueue = 100
)

// StartMediaPersistWorker starts a single-worker async persist queue.
func StartMediaPersistWorker() {
	mediaPersistOnce.Do(func() {
		mediaPersistCh = make(chan MediaPersistJob, mediaPersistQueue)
		go mediaPersistLoop()
		common.SysLog("media storage: persist worker started")
	})
}

// EnqueueMediaPersist queues a job; drops with log if queue is full.
func EnqueueMediaPersist(job MediaPersistJob) {
	if !MediaStorageEnabled() || mediaPersistCh == nil {
		return
	}
	if job.SourceURL == "" || job.UserId <= 0 {
		return
	}
	select {
	case mediaPersistCh <- job:
	default:
		common.SysError("media storage: persist queue full, dropping job task=" + job.TaskId)
	}
}

func mediaPersistLoop() {
	for job := range mediaPersistCh {
		mediaPersistOne(job)
	}
}

func mediaPersistOne(job MediaPersistJob) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	// Skip if already persisted for this task.
	if job.TaskId != "" {
		if existing, err := model.GetActiveMediaObjectByTaskId(job.TaskId); err == nil && existing != nil {
			rewriteTaskResultURL(job.TaskId, existing.PublicId)
			return
		}
	}

	var lastErr error
	for attempt := 0; attempt < 2; attempt++ {
		obj, err := PersistFromURL(ctx, job.UserId, job.Kind, job.TaskId, job.SourceURL, job.MimeType)
		if err == nil && obj != nil {
			rewriteTaskResultURL(job.TaskId, obj.PublicId)
			common.SysLog("media storage: persisted task=" + job.TaskId + " public_id=" + obj.PublicId)
			return
		}
		lastErr = err
		time.Sleep(time.Duration(attempt+1) * 2 * time.Second)
	}
	if lastErr != nil {
		common.SysError("media storage: persist failed task=" + job.TaskId + ": " + lastErr.Error())
	}
}

func rewriteTaskResultURL(taskId, publicId string) {
	if taskId == "" || publicId == "" {
		return
	}
	task, exists, err := model.GetByOnlyTaskId(taskId)
	if err != nil || !exists || task == nil {
		return
	}
	task.PrivateData.ResultURL = BuildMediaURL(publicId, 0)
	// Unconditional update of private_data only — task already success.
	_ = model.DB.Model(task).Select("private_data").Updates(task).Error
}

// StartMediaJanitor periodically soft-deletes expired objects and removes R2 keys.
func StartMediaJanitor() {
	mediaJanitorOnce.Do(func() {
		go mediaJanitorLoop()
		common.SysLog("media storage: janitor started")
	})
}

func mediaJanitorLoop() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	// initial delay so startup is light
	time.Sleep(2 * time.Minute)
	for {
		runMediaJanitorOnce()
		<-ticker.C
	}
}

func runMediaJanitorOnce() {
	if !MediaStorageEnabled() {
		return
	}
	rows, err := model.ListExpiredMediaObjects(50)
	if err != nil || len(rows) == 0 {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	client := MediaR2()
	for i := range rows {
		obj := &rows[i]
		if client != nil {
			_ = client.DeleteObject(ctx, obj.ObjectKey)
		}
		_ = model.SoftDeleteMediaObject(obj.Id)
	}
	common.SysLog("media storage: janitor cleaned " + itoa(len(rows)) + " expired objects")
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [12]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	return string(b[i:])
}
