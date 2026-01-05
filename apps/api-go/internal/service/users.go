package service

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/auth"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/dto"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

/*
repo is a interface :

  - In Go, interfaces a re already references.

  - When you assign a struct that implements the interface, the interface value
    contains a pointer to the concrete type + type info internally.

  - var r repository.UserRepository = &userRepository{db: db}

    r holds a reference to userRepository.
    Methods called on r automatically operate on the original object.

jwtManager is a concrete struct

  - every UserService will get a copy of the struct

    Secret byte slice would be duplicated in memory
    Any mutation (e.g., changing TTL) would affect only that copy

  - *auth.JWTManager

    One shared instance
    Efficient
    Can safely mutate if needed
*/
type UserService struct {
	repo       repository.UserRepository
	jwtManager *auth.JWTManager
}

func NewUserService(repo repository.UserRepository, jwtManager *auth.JWTManager) *UserService {
	return &UserService{
		repo:       repo,
		jwtManager: jwtManager,
	}
}

func (s *UserService) Signup(
	ctx context.Context,
	email string,
	password string,
) (*domain.User, error) {
	/*
		- bcrypt.GenerateFromPassword : It hashes a password using bcrypt algorithm.
		- []byte(password) : Convert string to byte slice, since Go strings are immutable
	*/
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		// It controls how expensive the hashing is
		bcrypt.DefaultCost,
	)

	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Role:     domain.RoleUser, // DEFAULT ROLE
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

/*
This should check only user identity ( no JWT, no refresh_token )
*/
func (s *UserService) Authenticate(
	ctx context.Context,
	email string,
	password string,
) (*domain.User, error) {

	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	/*s
	bcrypt.CompareHashAndPassword : Checks if plain text password matches the hashed password
	*/
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password), // hashed password
		[]byte(password),      // plain text password
	); err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	// Generate JWT token

	// token, err := s.jwtManager.GenerateAccessToken(user.ID, user.Role)
	// if err != nil {
	// 	return "", err
	// }
	return user, nil
}

func (s *UserService) ListUsers(ctx context.Context) ([]dto.SignupResponse, error) {
	users, err := s.repo.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	// Declare resp variable of type array of dto.SignupResponse with min len = 0, max len = len(users)
	resp := make([]dto.SignupResponse, 0, len(users))

	for _, user := range users {
		// Append each user to resp
		resp = append(resp, dto.SignupResponse{
			ID:    user.ID,
			Email: user.Email,
			Role:  string(user.Role),
		})
	}
	return resp, nil
}
