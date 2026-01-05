package domain

import "time"

/*
Domain Model :
1. Represents how your business thinks about User
2. Used by :
	- Repository layer
	- Service layer
	- Database Mapping

What json:"" tags do ?
It controls :
	- How structs are serialised to JSON
	- How JSON is decoded into structs

Why adding json tags to domain.User is a bad idea ?
	- You'll accidently expose sesitive fields like password
*/

// Domain structs can include db tags ( for sqlx )
// db tags allow sqlx.StructScan to map DB columns -> struct fields

type User struct {
	ID        string    `db:"id"`
	Email     string    `db:"email"`
	Password  string    `db:"password"`
	CreatedAt time.Time `db:"created_at"`
	Role      Role      `db:"role"`
}

/*
For HTTP you need to create REQUEST, RESPONSE DTOs
*/
