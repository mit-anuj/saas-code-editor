//! This file is created to verify that the webhook sent by the clerk to convex after creating new user is authenticated or not.

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import {api} from "./_generated/api"

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret)
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Error occured -- no svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-signature': svix_signature,
        'svix-timestamp': svix_timestamp
      })as WebhookEvent;
    } catch (error) {
      console.error('Error verifying webhooks: ', error);
      return new Response('Error occured', {status: 400})
    }

    const eventType = evt.type;
    if(eventType === 'user.created'){
      const {id,email_addresses, first_name, last_name} = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ''} ${last_name || ''}`.trim();

      try {
        // save user info
        await ctx.runMutation(api.users.syncUser,{
          userId: id,
          email,
          name
        })
      } catch (error) {
        console.log("error creating user")
        return new Response('Error creating user ', {status : 500});
      }
    }

    return new Response('Webhook processed successfully', {status: 200});
  }),
});

export default http;