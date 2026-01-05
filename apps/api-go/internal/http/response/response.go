package response

// All API Response will look like this

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"` // omitempty : avoids clutter
	Message string      `json:"message,omitempty"`
	Error   string      `json:"error,omitempty"`
}
