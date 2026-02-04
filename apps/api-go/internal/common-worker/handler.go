package worker

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

// Core Handler every worker must implement

/*
Interface : Set of method signature that a type must have
Name(), Handle() are methods ( functions attached to a type )
*/
type Handler interface {
	Name() string
	Handle(ctx context.Context, msg domain.StreamMessage) error
}

// For worker that wants reclaim support ( notification )
type Reclaimer interface {
	Reclaim(ctx context.Context) error
}
