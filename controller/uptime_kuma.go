package controller

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/setting/console_setting"

	"github.com/gin-gonic/gin"
	"golang.org/x/sync/errgroup"
)

const (
	requestTimeout   = 30 * time.Second
	httpTimeout      = 10 * time.Second
	uptimeKeySuffix  = "_24"
	apiStatusPath    = "/api/status-page/"
	apiHeartbeatPath = "/api/status-page/heartbeat/"
	historyBarCount  = 40
	historyFetchMax  = 90
)

// Uptime suffixes ordered longest window first (Uptime Kuma status-page API).
var uptimeKeySuffixes = []string{"_720", "_90", "_30", "_24"}

type Monitor struct {
	Name      string  `json:"name"`
	Uptime    float64 `json:"uptime"`
	Uptime24h float64 `json:"uptime_24h,omitempty"`
	Status    int     `json:"status"`
	Group     string  `json:"group,omitempty"`
	History   []int   `json:"history,omitempty"`
}

type UptimeGroupResult struct {
	CategoryName string    `json:"categoryName"`
	Monitors     []Monitor `json:"monitors"`
}

func resolveUptime(uptimeList map[string]float64, monitorID string) (primary float64, uptime24h float64) {
	for _, suffix := range uptimeKeySuffixes {
		if uptime, exists := uptimeList[monitorID+suffix]; exists {
			primary = uptime
			break
		}
	}
	if uptime, exists := uptimeList[monitorID+uptimeKeySuffix]; exists {
		uptime24h = uptime
	}
	return primary, uptime24h
}

func buildMonitorHistory(heartbeats []struct {
	Status int `json:"status"`
}, targetBars int) []int {
	if len(heartbeats) == 0 || targetBars <= 0 {
		return nil
	}

	// Heartbeats are newest-first; reverse to oldest-first for left-to-right bars.
	statuses := make([]int, 0, len(heartbeats))
	for i := len(heartbeats) - 1; i >= 0; i-- {
		statuses = append(statuses, heartbeats[i].Status)
	}

	if len(statuses) <= targetBars {
		return statuses
	}

	// Downsample evenly to targetBars buckets.
	out := make([]int, targetBars)
	step := float64(len(statuses)) / float64(targetBars)
	for i := 0; i < targetBars; i++ {
		start := int(float64(i) * step)
		end := int(float64(i+1) * step)
		if end <= start {
			end = start + 1
		}
		if end > len(statuses) {
			end = len(statuses)
		}
		worst := statuses[start]
		for j := start + 1; j < end; j++ {
			if statuses[j] < worst {
				worst = statuses[j]
			}
		}
		out[i] = worst
	}
	return out
}

func getAndDecode(ctx context.Context, client *http.Client, url string, dest interface{}) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("non-200 status")
	}

	return json.NewDecoder(resp.Body).Decode(dest)
}

func fetchGroupData(ctx context.Context, client *http.Client, groupConfig map[string]interface{}) UptimeGroupResult {
	url, _ := groupConfig["url"].(string)
	slug, _ := groupConfig["slug"].(string)
	categoryName, _ := groupConfig["categoryName"].(string)

	result := UptimeGroupResult{
		CategoryName: categoryName,
		Monitors:     []Monitor{},
	}

	if url == "" || slug == "" {
		return result
	}

	baseURL := strings.TrimSuffix(url, "/")

	var statusData struct {
		PublicGroupList []struct {
			ID          int    `json:"id"`
			Name        string `json:"name"`
			MonitorList []struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"monitorList"`
		} `json:"publicGroupList"`
	}

	var heartbeatData struct {
		HeartbeatList map[string][]struct {
			Status int `json:"status"`
		} `json:"heartbeatList"`
		UptimeList map[string]float64 `json:"uptimeList"`
	}

	g, gCtx := errgroup.WithContext(ctx)
	g.Go(func() error {
		return getAndDecode(gCtx, client, baseURL+apiStatusPath+slug, &statusData)
	})
	g.Go(func() error {
		return getAndDecode(gCtx, client, baseURL+apiHeartbeatPath+slug, &heartbeatData)
	})

	if g.Wait() != nil {
		return result
	}

	for _, pg := range statusData.PublicGroupList {
		if len(pg.MonitorList) == 0 {
			continue
		}

		for _, m := range pg.MonitorList {
			monitor := Monitor{
				Name:  m.Name,
				Group: pg.Name,
			}

			monitorID := strconv.Itoa(m.ID)

			uptime, uptime24h := resolveUptime(heartbeatData.UptimeList, monitorID)
			monitor.Uptime = uptime
			if uptime24h > 0 {
				monitor.Uptime24h = uptime24h
			}

			if heartbeats, exists := heartbeatData.HeartbeatList[monitorID]; exists && len(heartbeats) > 0 {
				monitor.Status = heartbeats[0].Status
				if len(heartbeats) > historyFetchMax {
					heartbeats = heartbeats[:historyFetchMax]
				}
				monitor.History = buildMonitorHistory(heartbeats, historyBarCount)
			}

			result.Monitors = append(result.Monitors, monitor)
		}
	}

	return result
}

// GetPublicStatusPageURL returns the first configured Uptime Kuma public status page URL.
func GetPublicStatusPageURL() string {
	groups := console_setting.GetUptimeKumaGroups()
	if len(groups) == 0 {
		return ""
	}
	url, _ := groups[0]["url"].(string)
	slug, _ := groups[0]["slug"].(string)
	url = strings.TrimSuffix(strings.TrimSpace(url), "/")
	slug = strings.TrimSpace(slug)
	if url == "" || slug == "" {
		return ""
	}
	return url + "/status/" + slug
}

func GetUptimeKumaStatus(c *gin.Context) {
	groups := console_setting.GetUptimeKumaGroups()
	if len(groups) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "", "data": []UptimeGroupResult{}})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), requestTimeout)
	defer cancel()

	client := &http.Client{Timeout: httpTimeout}
	results := make([]UptimeGroupResult, len(groups))

	g, gCtx := errgroup.WithContext(ctx)
	for i, group := range groups {
		i, group := i, group
		g.Go(func() error {
			results[i] = fetchGroupData(gCtx, client, group)
			return nil
		})
	}

	g.Wait()
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "", "data": results})
}
