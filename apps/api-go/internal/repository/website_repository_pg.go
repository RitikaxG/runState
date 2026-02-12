package repository

import (
	"context"
	"database/sql"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

/*
websiteRepository struct is the implementation of WebsiteRepository interface.
It wraps the database connection (*sqlx.DB) and provides methods like `Create` that actually interact with DB.

Why struct was needed :
1. It holds dependencies ( db *sqlx.DB ).
  - By storing it inside struct, you can reuse the same DB connection across all methods.

2. It implements interface methods

	Go’s interfaces are implicit:
	- Any type that has a Create(ctx, website) method automatically satisfies this interface.
	- websiteRepository has a receiver (r *websiteRepository) → implements Create() → satisfies WebsiteRepository.

3. Encapsulation
  - The websiteRepository struct hides DB details.
  - Service layer only sees WebsiteRepository interface → doesn’t care if it’s Postgres, MySQL, or in-memory.
  - Only websiteRepository knows about *sqlx.DB and SQL queries.

4. Reusability & Consistency
  - All DB operations for Website live in this struct.
  - No need to open/close DB repeatedly.
  - Ensures thread-safe, shared connection usage.
*/
type websiteRepository struct {
	db *sqlx.DB
}

/*
1. Input  : db *sqlx.DB -> pointer to ur SQL connection
2. Output : WebsiteRepository -> interface type

- What is actually returned ?
return &websiteRepository{db: db}

- Here you are creating a pointer to the struct:
&websiteRepository{db: db} // type: *websiteRepository

*websiteRepository implements the WebsiteRepository interface because it has a method Create(ctx, website) that matches the interface signature.
Go’s interface implementation is implicit — you don’t have to declare “implements”.

So technically:

- Struct instance (*websiteRepository) → concrete type
- Returned as interface (WebsiteRepository) → abstract type

this is done for decoupling Service layer only knows WebsiteRepository interface,
it doesn't care that it's actually *websiteRepository ( Postgres implementation )
*/
func NewWebsiteRepository(db *sqlx.DB) WebsiteRepository {
	return &websiteRepository{db: db}
}

/*
1. r.db.QueryRowxContext(...)

	- r → receiver, your websiteRepository struct
	- db → *sqlx.DB connection
	- QueryRowxContext → executes a single-row query using a context.Context

2. $1 → replaced with website.URL
	RETURNING id, timeAdded → Postgres returns the generated ID and timestamp for the new row

3. .Scan(&website.ID, &website.TimeAdded)

	Scan maps the returned columns into your Go struct fields
	- &website.ID → pointer to ID field in the struct
	- &website.TimeAdded → pointer to TimeAdded field

	Key points:
	- You need exported fields (ID, TimeAdded) for Scan to work
	- Scan will overwrite these fields with values returned from DB
*/

func (r *websiteRepository) Create(ctx context.Context, website *domain.Website) error {
	query := `
	INSERT INTO website (user_id, url)
	VALUES ($1, $2) 
	RETURNING id, user_id, url, time_added
	`

	err := r.db.QueryRowxContext(
		ctx,
		query,
		website.UserID,
		website.URL,
	).Scan(&website.ID, &website.UserID, &website.URL, &website.TimeAdded)

	if err != nil {
		/*
			err.(*pq.Error) : err is an error interface, under the hood it might be a pg.Error
			i.e POstgreSQL Error.
				- , ok : if ok == true postgres error , ok == false some other error ( network, context )
				- PostgreSQL uses SQLSTATE codes , 23505 means UNIQUE constraint violation.
				- if pgError.Code == "23505" return "URL already exists"
		*/
		if pqError, ok := err.(*pq.Error); ok {
			if pqError.Code == "23505" {
				return domain.ErrURLAlreadyExists
			}
		}
		return err
	}
	return nil
}

func (r *websiteRepository) GetByID(
	ctx context.Context,
	websiteID string,
) (*domain.Website, error) {

	query := `
	SELECT id , url, user_id, time_added
	FROM website 
	WHERE id = $1
	`

	var website domain.Website

	err := r.db.QueryRowxContext(
		ctx,
		query,
		websiteID,
	).StructScan(&website)

	if err != nil {
		return nil, err
	}

	return &website, nil

}

func (r *websiteRepository) DeleteByIdAndUserId(
	ctx context.Context,
	websiteID string,
	userID string,
) error {

	query := `
	DELETE FROM website
	WHERE id = $1 AND user_id = $2
	`

	result, err := r.db.ExecContext(ctx, query, websiteID, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return domain.ErrWebsiteNotFound
	}
	return nil
}

func (r *websiteRepository) DeleteByID(
	ctx context.Context,
	websiteID string,
) error {

	query := `
	DELETE FROM website
	WHERE id = $1 
	`

	result, err := r.db.ExecContext(ctx, query, websiteID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return domain.ErrWebsiteNotFound
	}
	return nil
}

func (r *websiteRepository) ListAllWebsites(
	ctx context.Context,
) ([]domain.Website, error) {
	query := `
	SELECT * FROM website
	`

	var websites []domain.Website
	if err := r.db.SelectContext(ctx, &websites, query); err != nil {
		return nil, err
	}

	return websites, nil
}

func (r *websiteRepository) UpdateWebsiteStatus(
	ctx context.Context,
	websiteId string,
	status domain.WebsiteStatus,
) error {
	query := `
	UPDATE website
	SET current_status = $1
	WHERE id = $2
	`

	res, err := r.db.ExecContext(ctx, query, status, websiteId)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *websiteRepository) GetUserEmailByWebsiteID(
	ctx context.Context,
	websiteId string,
) (string, error) {
	query := `
	SELECT u.email
	FROM website w
	JOIN users u ON w.user_id = u.id
	WHERE w.id = $1
	`

	var email string
	err := r.db.GetContext(ctx, &email, query, websiteId)
	if err != nil {
		return "", err
	}

	return email, nil
}
