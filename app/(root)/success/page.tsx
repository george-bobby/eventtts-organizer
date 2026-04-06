import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrderByPaymentId } from "@/lib/actions/order.action";

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function SuccessContent({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const paymentId = typeof params.payment_id === "string" ? params.payment_id : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;

  // Payment failed — show error
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-700">Payment Failed</CardTitle>
            <CardDescription className="text-base mt-2">
              Your payment could not be processed. You have not been charged.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {paymentId && (
              <p className="text-xs text-muted-foreground font-mono">
                Reference: {paymentId}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Please try again or use a different payment method.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild>
                <Link href="/explore">Browse Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Try to find the order to redirect to the ticket page
  if (paymentId) {
    const order = await getOrderByPaymentId(paymentId);
    if (order?.event?._id) {
      redirect(`/event/${order.event._id}/ticket?success=true`);
    }
  }

  // Order not found yet (webhook may be delayed) — show pending state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              {status === "succeeded" ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Clock className="w-8 h-8 text-yellow-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800">
            {status === "succeeded" ? "Payment Successful!" : "Processing Payment…"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {status === "succeeded"
              ? "Your payment was received. Your ticket is being generated."
              : "Your payment is being confirmed. This usually takes a few seconds."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {paymentId && (
            <p className="text-xs text-muted-foreground font-mono">
              Payment ID: {paymentId}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Once confirmed, your ticket will appear in your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage(props: SuccessPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Confirming your payment…</p>
          </div>
        </div>
      }
    >
      <SuccessContent {...props} />
    </Suspense>
  );
}
