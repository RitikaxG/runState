package service

import (
	"context"
	"strings"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

/*
WebsiteService is a service layer component.

It groups:
- Business logic related to websites
- (Later) dependencies like database, cache, logger, etc.

This is similar to a "class" in other languages.
*/
type WebsiteService struct {
	repo repository.WebsiteRepository
}

/*
p
NewWebsiteService is a constructor function.

Why this exists:
- Go does not have class constructors
- We use functions prefixed with `New` to create instances
- This allows controlled creation and future dependency injection

What it does:
1. Creates a WebsiteService struct
2. Returns a pointer to it
*/
func NewWebsiteService(repo repository.WebsiteRepository) *WebsiteService { // Returns a pointer to created instance of WebsiteService object
	return &WebsiteService{repo: repo} // creates an instance of WebsiteService object
}

/*
CreateWebsite is a method on WebsiteService.

`s *WebsiteService` is called a method receiver.
It means:
- This function belongs to WebsiteService
- It can access WebsiteService's data and dependencies

The function:
- Accepts a raw URL
- Applies business rules
- Returns either:
  - a normalized URL (success)
  - an error (failure)
*/
func (s *WebsiteService) CreateWebsite(
	ctx context.Context,
	userID string,
	url string,
) (*domain.Website, error) {

	// 1. Normalized URL
	normalisedUrl := strings.TrimSpace(url)

	if normalisedUrl == "" {
		return nil, domain.ErrInvalidURL
	}

	if strings.Contains(normalisedUrl, "localhost") {
		return nil, domain.ErrInvalidURL
	}

	/* 3. Create domain entity
	- this creates a new domain object n memory
	- & means you are creating a pointer of type domain.Website
	*/
	website := &domain.Website{
		URL:    normalisedUrl,
		UserID: userID,
	}

	// 4. Persist
	// s.REpo.Create : Repository, please save this Website entity to the database.
	if err := s.repo.Create(ctx, website); err != nil {
		return nil, err
	}

	// 5. Return fully populated entity
	return website, nil
}

func (s *WebsiteService) DeleteWebsite(
	ctx context.Context,
	userID string,
	role domain.Role,
	websiteID string,
) error {
	website, err := s.repo.GetByID(ctx, websiteID)
	if err != nil {
		return err
	}

	if role == domain.RoleAdmin {
		return s.repo.DeleteByID(ctx, websiteID)
	}

	// If userID is not equal to id of user who created the website he can't delete he has to be the admin to do so
	if website.UserID != userID {
		return domain.ErrForbidden
	}
	return s.repo.DeleteByIdAndUserId(ctx, websiteID, userID)
}

func (s *WebsiteService) ListAllWebsites(
	ctx context.Context,
) ([]domain.Website, error) {

	websites, err := s.repo.ListAllWebsites(ctx)
	if err != nil {
		return nil, err
	}

	return websites, nil
}

func (s *WebsiteService) UpdateWebsiteStatus(
	ctx context.Context,
	websiteId string,
	status domain.WebsiteStatus,
) error {
	return s.repo.UpdateWebsiteStatus(ctx, websiteId, status)
}

func (s *WebsiteService) GetUserEmailByWebsiteID(
	ctx context.Context,
	websiteId string,
) (string, error) {
	return s.repo.GetUserEmailByWebsiteID(ctx, websiteId)
}
