package repository

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

/*
Repositories deal with domain models are persistence - never DTOs and never workflows
*/
type UserRepository interface {
	CreateUser(ctx context.Context, user *domain.User) error
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	ListUsers(ctx context.Context) ([]domain.User, error)
	GetById(ctx context.Context, userID string) (*domain.User, error)
}
