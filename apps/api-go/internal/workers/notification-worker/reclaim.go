package notificationworker

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

func (nw *NotificationWorker) handleReclaimedMessage(
	ctx context.Context,
	msg domain.StreamMessage,
) error {
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
