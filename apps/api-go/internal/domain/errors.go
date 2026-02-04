package domain

import "errors"

// Plain Go Errors
// These errors describe business rules. They are shared by service, handler, middleware
var (
	ErrInvalidURL          = errors.New("invalid url")
	ErrURLAlreadyExists    = errors.New("URL already exists")
	ErrNotFound            = errors.New("website not found")
	ErrInternal            = errors.New("internal error")
	ErrMissingAuthHeader   = errors.New("missing authorization header")
	ErrInvalidAuthFormat   = errors.New("invalid authorization format")
	ErrInvalidToken        = errors.New("invalid or expired token")
	ErrUserNotInContext    = errors.New("user not found in context")
	ErrRateLimitExceeded   = errors.New("rate limit exceeded")
	ErrEmailAlreadyExists  = errors.New("email already exists")
	ErrInvalidCredentials  = errors.New("invalid user email or password")
	ErrForbidden           = errors.New("forbidden")
	ErrUnauthorized        = errors.New("Unauthorized")
	ErrWebsiteNotFound     = errors.New("website not found")
	ErrInvalidRefreshToken = errors.New("invalid refresh token")
	ErrTicksInputNotFound  = errors.New("websiteID or regionID not found")
)
