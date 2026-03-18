export type WebsiteStatus = "up" | "down" | "unknown"

export type Website = {
    id : string,
    name? : string,
    url : string,
    status? : WebsiteStatus,
    createdAt? : string
    latestResponseTimeMs? : number | null,
    latestCheckedAt? : string | null
}

export type WebsitesResponse = {
    success : boolean,
    data? : Website[],
    error? : string
}