package domain

/* Since this function takes pure input, pure output and does not depend
on worker state, its placed in domain package

*/

type EventType string

const (
	StatusDown     EventType = "DOWN"
	StatusRecovery EventType = "RECOVERY"
)

func GetEventType(
	prevStatus WebsiteStatus,
	currentStatus WebsiteStatus,
) *EventType {
	if prevStatus == WebsiteUp && currentStatus == WebsiteDown {
		t := StatusDown
		return &t
	}
	if prevStatus == WebsiteDown && currentStatus == WebsiteUp {
		t := StatusRecovery
		return &t
	}
	return nil
}
