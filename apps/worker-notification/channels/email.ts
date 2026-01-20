import type { NotificationChannel, NotificationPayload } from "./types";
import FormData from "form-data"; 
import Mailgun from "mailgun.js"; 
import { env } from "../env";

const MAILGUN_API_KEY = env.MAILGUN_API_KEY;


export class EmailChannel implements NotificationChannel {
    async send(payload: NotificationPayload): Promise<void> {
        console.log(`Website ${payload.websiteId} is ${payload.eventType} at ${payload.occurredAt}`);
        await sendEmailViaMailgun(payload);
    }
}

async function sendEmailViaMailgun( payload : NotificationPayload ) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: MAILGUN_API_KEY,
  });
  try {
    const data = await mg.messages.create("sandboxf0ae1aa71b334d07abbef5327293e589.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxf0ae1aa71b334d07abbef5327293e589.mailgun.org>",
      to: [payload.email],
      subject: `Website Alert ${payload.eventType}`,
      text: `Your website ${payload.websiteId} is ${payload.eventType} at ${payload.occurredAt}`,
    });

    console.log("Email sent",data); // logs response data
  } catch (error) {
    console.error(`Mailgun failed`,error); //logs any error
  }
}
