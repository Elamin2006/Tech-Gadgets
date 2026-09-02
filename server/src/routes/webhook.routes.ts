import express from "express";

import {
  stripeWebhook,
} from "../controllers/webhook.controller.js";

const webhookRouter =
  express.Router();

/**
 * Stripe requires the raw request body
 * to verify the webhook signature.
 * so we must not place express.json() before this route.
 */
webhookRouter.post(
  "/",
  express.raw({
    type: "application/json",
  }),
  stripeWebhook,
);

export default webhookRouter;

