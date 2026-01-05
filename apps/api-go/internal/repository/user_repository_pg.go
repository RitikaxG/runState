package repository

import (
	"context"
	"database/sql"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(ctx context.Context, user *domain.User) error {
	query := `
	INSERT INTO users (email, password, role)
	VALUES ($1, $2, $3) 
	RETURNING id, email, role
	`

	err := r.db.QueryRowxContext(
		ctx,
		query,
		user.Email,
		user.Password,
		user.Role,
	).Scan(&user.ID, &user.Email, &user.Role)

	if err != nil {
		if pqError, ok := err.(*pq.Error); ok {
			if pqError.Code == "23505" {
				return domain.ErrEmailAlreadyExists
			}
		}
		return err
	}
	return nil
}

func (r *userRepository) GetUserByEmail(
	ctx context.Context,
	email string,
) (*domain.User, error) {

	query := `
	SELECT id, email, password, role
	FROM users
	WHERE email = $1
	`

	var user domain.User

	err := r.db.QueryRowxContext(
		ctx,
		query,
		email,
	).StructScan(&user)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrInvalidCredentials
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) ListUsers(
	ctx context.Context,
) ([]domain.User, error) {

	query := `
	SELECT id, email, role, created_at 
	FROM users
	ORDER BY created_at DESC
	`
	var users []domain.User

	err := r.db.SelectContext(ctx, &users, query)

	if err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepository) GetById(
	ctx context.Context,
	userId string,
) (*domain.User, error) {

	query := `
	SELECT id, email, password, role
	FROM users
	WHERE id = $1
	`

	var user domain.User

	err := r.db.QueryRowxContext(
		ctx,
		query,
		userId,
	).StructScan(&user)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrInvalidCredentials
		}
		return nil, err
	}
	return &user, nil
}
