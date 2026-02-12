package notificationworker

import (
	"encoding/json"
	"log"
	"time"
)

type NotificationStatus string

const (
	NotifSent        NotificationStatus = "SENT"
	NotifAlreadySent NotificationStatus = "ALREADY SENT"
	NotifNoOp        NotificationStatus = "NO_OP"
	NotifDLQ         NotificationStatus = "DLQ"
	NotifFailed      NotificationStatus = "FAILED"
	NotifThrottled   NotificationStatus = "THROTTLED"
	NotifSkipped     NotificationStatus = "SKIPPED"
)

func LogNotification(
	fields map[string]string,
) {
	logFields := make(map[string]string, len(fields)+2)
	for k, v := range fields {
		logFields[k] = v
	}
	logFields["service"] = "worker-notification"
	logFields["timestamp"] = time.Now().UTC().Format(time.RFC3339)

	b, _ := json.Marshal(logFields)
	log.Println(string(b))
}
