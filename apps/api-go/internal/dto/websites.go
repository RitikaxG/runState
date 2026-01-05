package dto

// DTO is used for moving data between client <-> server
// Data Transfer Object ( DTO ) : struct whose job is to describe data coming IN or going OUT of your system

/*
DTO defines:
1. shape of request body
2. shape of response body
3. validation rules
4. serialization ( json tags )
*/

type CreateWebsiteRequest struct {
	URL string `json:"url" binding:"required,url,max=2048"`
}
