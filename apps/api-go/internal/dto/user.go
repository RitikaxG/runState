package dto

/*
DTOs are used only in handlers
*/

type SignupRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,password" validate:"password"`
}

type SigninRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type SignupResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type SigninResponse struct {
	AccesToken   string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

/*
Gin will automatically :

1. Call your custom validator
2. Reject Invalid Passwords
3. Return validation errors
*/
