import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/presentation/domains/8-core-ux-navigation/ui/button";
import { getCheckoutState } from "@/application/use-cases/commerce/initiate-checkout";

export const Route = createFileRoute("/checkout/success")({
  component: CheckoutSuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    intent: typeof search.intent === "string" ? search.intent : undefined,
  }),
});

function CheckoutSuccessPage() {
  const { intent } = useSearch({ from: "/checkout/success" });
  const fetchState = useServerFn(getCheckoutState);
  const { data, isPending } = useQuery({
    queryKey: ["checkout-state", intent],
    queryFn: () => fetchState({ data: { intentId: intent! } }),
    enabled: !!intent,
    retry: 1,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" || !query.state.data?.status ? 5000 : false,
  });

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: data?.currency ?? "USD",
  }).format((data?.gross_cents ?? 0) / 100);

  let heading = "Payment not confirmed";
  let body =
    "We could not confirm a payment for this link. It may have expired or you may need to sign in.";
  let icon = <XCircle className="h-12 w-12 text-muted-foreground" />;

  if (isPending) {
    heading = "Checking payment…";
    body = "Hold on — we're confirming the payment status.";
  } else if (!data) {
    heading = "Payment not confirmed";
    body =
      "We could not confirm a payment for this link. It may have expired or you may need to sign in.";
  } else if (data.status === "succeeded") {
    heading = "Payment received";
    body = `Your payment of ${amount} was received successfully. Your prepaid lessons have been credited and you can now book with your tutor.`;
    icon = <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
  } else if (data.status === "pending") {
    heading = "Payment is processing";
    body = `${amount} is being confirmed by the payment provider. Lessons are credited as soon as the payment is confirmed.`;
    icon = <Clock className="h-12 w-12 text-amber-500" />;
  } else if (data.status === "failed") {
    heading = "Payment not completed";
    body = `The payment attempt of ${amount} did not go through. No charge was made — you can try again from the pay page.`;
    icon = <XCircle className="h-12 w-12 text-rose-500" />;
  } else {
    heading = "Payment refunded";
    body = `This payment of ${amount} has been refunded. If that looks wrong, contact support.`;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      {icon}
      <h1 className="text-2xl font-semibold">{heading}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      <Button asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
