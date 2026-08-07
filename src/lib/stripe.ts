import Stripe from "stripe";
import config from "../config/index.js";

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export default stripe;
