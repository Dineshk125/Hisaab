import Pusher from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = process.env.PUSHER_APP_ID 
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null;

export const pusherClient = process.env.NEXT_PUBLIC_PUSHER_KEY 
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.PUSHER_CLUSTER || "ap2",
    })
  : null;
