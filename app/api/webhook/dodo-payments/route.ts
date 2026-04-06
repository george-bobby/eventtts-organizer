import { Webhooks } from "@dodopayments/nextjs";
import { createOrder } from "@/lib/actions/order.action";

const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

const ConfiguredPOST =
  webhookKey &&
  Webhooks({
    webhookKey,
    onPaymentSucceeded: async (payload) => {
      const d = (payload as any)?.data ?? {};
      const meta = (d?.metadata ?? {}) as Record<string, string>;

      const paymentId = (d?.payment_id ?? d?.id) as string;
      const totalAmountMinor =
        typeof d?.total_amount === "number" ? d.total_amount : 0;
      const currency = (d?.currency ?? "INR") as string;

      const totalAmount = Math.round(totalAmountMinor) / 100;

      const totalTickets = Number(meta.totalTickets ?? 1);
      const user = String(meta.userId ?? "");
      const eventId = meta.eventId as string | undefined;
      const subEventId = meta.subEventId as string | undefined;

      if (!paymentId || !user || !eventId) {
        console.warn("Dodo webhook missing required fields", {
          paymentId,
          user,
          eventId,
          subEventId,
          currency,
          totalAmountMinor,
        });
        return;
      }

      const eventRef = subEventId ? { _id: eventId, subEventId } : eventId;

      await createOrder({
        paymentId,
        totalTickets:
          Number.isFinite(totalTickets) && totalTickets > 0
            ? totalTickets
            : 1,
        totalAmount,
        user,
        event: eventRef,
      });
    },
  });

// Avoid build-time crash when secret is not configured
export const POST =
  (ConfiguredPOST as
    | ((
        request: Request
      ) => Promise<Response> | Response)
    | undefined) ||
  (async () =>
    new Response("Webhook secret not configured", { status: 500 }));