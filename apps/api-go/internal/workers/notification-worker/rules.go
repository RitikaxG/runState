package notificationworker

type NotificationRule struct {
	Channel  string // "email", "webhook"
	NotifyOn string // "DOWN" | "RECOVERY" | "BOTH"
	Target   string
	Enabled  bool
}

func ShouldNotify(
	rule NotificationRule,
	eventType string,
) bool {
	if !rule.Enabled {
		return false
	}
	if rule.NotifyOn == "BOTH" {
		return true
	}
	return rule.NotifyOn == eventType
}
