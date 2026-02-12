package notificationworker

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

/*
What is reclaimed message ?
  - A message is delivered to a consumer.
  - If the consumer crashes beore ACKing the message, the message remains pending.
  - Another consumer can claim the pending message after a certain idle time (reclaimIdle).
*/
func (nw *NotificationWorker) handleReclaimedMessage(
	ctx context.Context,
	msg domain.StreamMessage,
) error {
	// Call the main handler
	err := nw.Handle(ctx, msg)
	if err != nil {
		return err
	}

	// ACK only if succeeded successfully
	return nw.redis.XAck(ctx,
		nw.stream,
		nw.group,
		[]string{msg.ID},
		3,
	)
}
