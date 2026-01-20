import dotenv from "dotenv";
dotenv.config();

// Define notification rules ( WHO should be notified )
const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
if(!ADMIN_EMAIL){
    throw new Error("ADMIN_EMAIL not found");
}

export type NotificationRule = {
    channel : "email" | "webhook",
    notifyOn : "DOWN" | "RECOVERY" | "BOTH",
    target : string,
    enabled : boolean
}

export const DEFAULT_RULES : NotificationRule[] = [
    {
        channel : "email",
        notifyOn : "BOTH",
        target : ADMIN_EMAIL,
        enabled : true
    }
]

export const shouldNotify = (
    rule : NotificationRule,
    statusEventType : "DOWN" | "RECOVERY"
) => {
    if(!rule.enabled) return false;
    if(rule.notifyOn === "BOTH") return true;
    return rule.notifyOn === statusEventType
}