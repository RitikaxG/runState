package notificationworker

import (
	"encoding/json"
	"log"
	"maps"
	"time"
)

/*
Structured Logger layer for notification worker
*/
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
	// Create a new map to avoid mutating the original fields map
	logFields := make(map[string]string, len(fields)+2)

	// Copies all key-value pairs from the input fields to the new logFields map
	maps.Copy(logFields, fields)

	logFields["service"] = "worker-notification"
	logFields["timestamp"] = time.Now().UTC().Format(time.RFC3339)

	// Convert the logFields map to a JSON string for structured logging
	b, _ := json.Marshal(logFields)
	log.Println(string(b))
}
