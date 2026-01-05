package db

import (
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

/*

_ "github.com/jackc/pgx/v5/stdlib"


That underscore import:

1. runs the package’s init() function
2. registers "pgx" as a valid driver

So "pgx" is just a key name for the driver.
*/

// dsn : DATABASE_URL i.e "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable"

/*
sqlx.DB is a database connection pool

Why a pool?

1. Creating DB connections is expensive
2. Pooling allows reuse
3. Handles concurrency safely
4. Automatically opens/closes connections as needed

*sqlx.DB is the shared DB access object for the entire app.
*/
func NewPostgres(dsn string) *sqlx.DB {
	/*
		sqlx.Connect :
		1. Create a DB pool (sqlx.DB)
		2. Open a connection using the driver
		3. Ping the database
		4. Return error if DB is unreachable

	*/
	db, err := sqlx.Connect("pgx", dsn) // "pgx" : use the pgx PostgreSQL Driver
	if err != nil {
		log.Fatalf("Failed to connect to postgres : %v", err)
	}
	return db
}
