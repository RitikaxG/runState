package dto

type ListIncidentsResponse struct {
	Incidents []IncidentResponse `json:"incidents"`
}
