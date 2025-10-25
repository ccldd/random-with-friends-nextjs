import PusherClient from "pusher-js";
import PusherServer from "pusher";

interface PusherClientWithConfig extends PusherClient {
  config: any; // Using any for now since we just need the auth property
}

// Initialize Pusher Client
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
}) as PusherClientWithConfig;

// Initialize Pusher Server
export const pusherServer = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
