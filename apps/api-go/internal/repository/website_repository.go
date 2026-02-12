package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

/*
What is an interface in Go?

An interface defines behavior, not data.
It lists methods that any type must implement to “satisfy” the interface.
You don’t define how it works here — just what functions exist.

Think of it as a contract:
“Any repository that wants to be a WebsiteRepository must have a Create method with this signature.”

Breaking down your interface

type WebsiteRepository interface {
	Create(ctx context.Context, website *domain.Website) error
}

Parts:

1. Create : Name of the method
Describes the action: create a Website in the DB

2. ctx context.Context

Go’s way to pass cancellation, deadlines, and request-scoped data
Allows DB queries to be cancelled if HTTP request is cancelled

3. website *domain.Website

The input: pointer to the Website entity defined in domain
Repository will populate ID and TimeAdded after insertion

4. error return

Returns nil if successful
Returns an error if DB operation fails
*/

type WebsiteRepository interface {
	Create(ctx context.Context, website *domain.Website) error
	DeleteByID(ctx context.Context, websiteID string) error
	DeleteByIdAndUserId(ctx context.Context, websiteID string, userID string) error
	GetByID(ctx context.Context, websiteID string) (*domain.Website, error)
	ListAllWebsites(ctx context.Context) ([]domain.Website, error)
	UpdateWebsiteStatus(ctx context.Context, websiteId string, status domain.WebsiteStatus) error
	GetUserEmailByWebsiteID(ctx context.Context, websiteID string) (string, error)
}
