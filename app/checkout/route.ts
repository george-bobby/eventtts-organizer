import { Checkout } from "@dodopayments/nextjs";

// Static checkout support (optional). Keeps parity with docs examples.
// Returns: { checkout_url: string }
export const GET = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode" | undefined,
  type: "static",
});

// Preferred: Checkout Sessions via POST.
// Expects JSON body from server calls containing at least:
// { product_cart: [{ product_id: "pdt_xxx", quantity: number }], metadata?: Record<string, string>, customer?: { email?: string, name?: string } }
// Returns: { checkout_url: string }
export const POST = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  returnUrl: process.env.DODO_PAYMENTS_RETURN_URL,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode" | undefined,
  type: "session",
});