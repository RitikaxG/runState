package seed

import (
	"log"

	"github.com/jmoiron/sqlx"
)

func SeedRegion(db *sqlx.DB) error {
	regions := []string{
		"ap-south-1",
		"us-east-1",
		"eu-west-1",
	}

	query := `
	INSERT INTO region (name)
	VALUES ($1)
	ON CONFLICT (name) DO NOTHING 
	`

	// Start a Database Transaction
	tx, err := db.Beginx()
	if err != nil {
		return err
	}
	/*
		- Automatically rollsback if an error occurs
		- If commit() succeeds, the rollback will do nothing
	*/
	defer tx.Rollback()

	for _, region := range regions {
		// Insert each region, ignoring duplicates
		if _, err := tx.Exec(query, region); err != nil {
			return err
		}
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return err
	}

	log.Println("Region seeded successfully")
	return nil
}
