import Stripe from "stripe";

import config from "./env.js";

if (!config.STRIPE_SECRET_KEY) {
  throw new Error(
    "CRITICAL: STRIPE_SECRET_KEY is missing in .env file",
  );
}

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export default stripe;