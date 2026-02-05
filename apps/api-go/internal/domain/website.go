package domain

import "time"

/*
Think of domain as:

“What your application is about, independent of HTTP, DB, or framework.”

1. Service layer manipulates this struct.
2. Repository layer persists it.
3. Handler layer consumes/produces it for HTTP.

It’s your single source of truth for the data shape in your backend.

In Go , capitalised field = exported
What exported means ?
1. Accessible outside package
2. Reflection works ( for sqlx )

  - sqlx uses reflection to scan database rows into structs.
  - Reflection can only set exported fields.
  - So ID string works, id string does NOT.

3. JSON/HTTP marshalling works
  - Later, if you return Website in a JSON response, Go’s encoding/json can only serialize exported fields.

"Why `db` tags exist ?"
  - Maps Go struct field -> DB column
  - timeAdded → TimeAdded (camelCase → Go exported field)
*/

/*
HOW IT WORKS ?

1. Handler receives HTTP request → calls Service.
2. Service creates domain.Website → calls Repository.
3. Repository uses sqlx to write to DB → fills fields back (ID, CreatedAt).
4. Service returns fully populated domain.Website to Handler.
5. Handler returns JSON → uses the exported fields.
*/
type Website struct {
	ID            string         `db:"id"`
	UserID        string         `db:"user_id"`
	URL           string         `db:"url"`
	TimeAdded     time.Time      `db:"time_added"`
	CurrentStatus *WebsiteStatus `db:"current_status"` // optional
}

type WebsiteStatus string

const (
	WebsiteUp      WebsiteStatus = "up"
	WebsiteDown    WebsiteStatus = "down"
	WebsiteUnknown WebsiteStatus = "unknown"
)
