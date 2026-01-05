package apperror

import (
	"net/http"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

// Given an Error what HTTP Status should I send
func MapErrorToHTTPStatus(err error) int {
	switch err {
	case domain.ErrInvalidURL:
		return http.StatusBadRequest

	case domain.ErrNotFound:
		return http.StatusNotFound

	case domain.ErrURLAlreadyExists:
		return http.StatusConflict

	case domain.ErrEmailAlreadyExists:
		return http.StatusConflict

	case domain.ErrInternal:
		return http.StatusInternalServerError

	case domain.ErrMissingAuthHeader:
		return http.StatusUnauthorized

	case domain.ErrInvalidAuthFormat:
		return http.StatusUnauthorized

	case domain.ErrInvalidToken:
		return http.StatusUnauthorized

	case domain.ErrUserNotInContext:
		return http.StatusUnauthorized

	case domain.ErrInvalidCredentials:
		return http.StatusUnauthorized

	case domain.ErrUnauthorized:
		return http.StatusUnauthorized

	case domain.ErrRateLimitExceeded:
		return http.StatusTooManyRequests

	case domain.ErrForbidden:
		return http.StatusForbidden

	case domain.ErrWebsiteNotFound:
		return http.StatusNotFound

	case domain.ErrInvalidRefreshToken:
		return http.StatusUnauthorized

	default:
		return http.StatusInternalServerError
	}
}
