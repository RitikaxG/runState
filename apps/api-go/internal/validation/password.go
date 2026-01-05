package validation

import (
	"unicode"

	"github.com/go-playground/validator/v10"
)

/*
RegisterPasswordValidator func :
  - Receives Gin's validator engine
  - v is the object that stores all validation rules.
  - You call this func once at app startup
*/

func RegisterPasswordValidator(v *validator.Validate) {
	/*
		- v.RegisterValidation("password" : Registers a new rule named password
	*/
	v.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		/*
			- fl : current field being validated
			- Field() : Reflect value of that field
			- .String() :get actual string value
		*/
		password := fl.Field().String()

		if len(password) < 8 {
			return false
		}
		var hasUpper, hasLower, hasSpecial, hasNumber bool
		for _, ch := range password {
			switch {
			case unicode.IsUpper(ch):
				hasUpper = true
			case unicode.IsLower(ch):
				hasLower = true
			case unicode.IsDigit(ch):
				hasNumber = true
			case unicode.IsPunct(ch) || unicode.IsSymbol(ch):
				hasSpecial = true
			}
		}
		return hasUpper && hasLower && hasNumber && hasSpecial
	})
}
