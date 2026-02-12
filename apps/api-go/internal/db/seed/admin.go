package seed

import (
	"errors"
	"os"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

// Creates a default admin user in the database only if it doesn't already exists.

func SeedAdmin(db *sqlx.DB) error {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")

	if adminEmail == "" || adminPassword == "" {
		return errors.New("ADMIN_EMAIL or ADMIN_PASSWORD not set")
	}

	query := `
	INSERT INTO users (email, password, role)
	VALUES ($1, $2, 'ADMIN')
	ON CONFLICT (email) DO NOTHING
	`

	hashed, err := bcrypt.GenerateFromPassword(
		[]byte(adminPassword),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}

	_, err = db.Exec(
		query,
		adminEmail,
		string(hashed),
	)
	return err
}
