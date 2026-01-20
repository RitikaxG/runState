import { websiteRepo } from "./website.repo";

export const websiteService = {
    resolveUserEmailForWebsite : async ( websiteId : string) => {
        const result = await websiteRepo.getUserEmailByWebsiteId(websiteId);
        if(!result?.user.email){
            throw new Error("User email not found for website");
        }
        return result.user.email
    }
}