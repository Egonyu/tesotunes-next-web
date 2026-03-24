"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Check,
  CheckCircle,
  ChevronLeft,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Shield,
  Smartphone,
} from "lucide-react";
import { apiGet, apiPost, isApiError } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { formatPhoneNumber } from "@/hooks/usePayments";
import { getStoreProductName, getStoreProductPrice } from "@/lib/store-product-utils";
import { toast } from "sonner";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    title?: string;
    name?: string;
    price?: number;
    price_ugx?: number;
  };
  price?: number;
  price_ugx?: number;
}

interface CartApiResponse {
  data?: {
    items?: CartItem[];
    total?: number;
    total_ugx?: number;
  };
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface OrderRecord {
  order_number: string;
}

interface CreateOrderResponse {
  data: OrderRecord;
}

interface StorePaymentResponse {
  data: {
    payment_reference?: string;
    order_number: string;
    payment_method?: string;
  };
  message?: string;
}

interface StorePaymentStatusResponse {
  data: {
    order_number: string;
    payment_status: "pending" | "paid" | "failed";
    payment_method?: string;
    payment_reference?: string | null;
    paid_at?: string | null;
  };
}

type CheckoutStep = "address" | "payment" | "confirm";
type PaymentMethodId = "mtn_momo" | "credits";
type PaymentState = "idle" | "processing" | "success" | "failed";

type ShippingAddress = {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  district: string;
  postal_code: string;
};

const emptyAddress: ShippingAddress = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  district: "",
  postal_code: "",
};

const PAYMENT_METHODS = [
  {
    id: "mtn_momo" as PaymentMethodId,
    name: "ZengaPay Mobile Money",
    description: "Create the order and pay through the store payment flow.",
    color: "bg-green-600",
    textColor: "text-white",
    icon: Smartphone,
  },
  {
    id: "credits" as PaymentMethodId,
    name: "Credits",
    description: "Use your TesoTunes credits balance.",
    color: "bg-primary",
    textColor: "text-primary-foreground",
    icon: CreditCard,
  },
];

function normalizeCartResponse(response: Cart | CartApiResponse): Cart {
  if ("items" in response && Array.isArray(response.items)) {
    return response;
  }

  const payload = "data" in response ? response.data : undefined;
  const items = payload?.items ?? [];
  const total = Number(payload?.total_ugx ?? payload?.total ?? 0);

  return {
    items,
    subtotal: total,
    shipping: 0,
    tax: 0,
    total,
  };
}

function getFormattedOrderPhone(paymentMethod: PaymentMethodId, phone: string): string {
  if (paymentMethod === "credits") {
    return "";
  }

  const cleaned = phone.replace(/[^0-9]/g, "");
  let normalized = cleaned;

  if (normalized.startsWith("0")) {
    normalized = `256${normalized.slice(1)}`;
  }

  if (!normalized.startsWith("256")) {
    normalized = `256${normalized}`;
  }

  return normalized;
}

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("mtn_momo");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(emptyAddress);
  const [notes, setNotes] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const { data: cart, isLoading: cartLoading, error, isError } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => normalizeCartResponse(await apiGet<Cart | CartApiResponse>("/store/cart")),
    retry: false,
  });

  const formattedPaymentPhone = useMemo(
    () => getFormattedOrderPhone(paymentMethod, shippingAddress.phone),
    [paymentMethod, shippingAddress.phone]
  );

  const paymentStatusQuery = useQuery({
    queryKey: ["store-payment-status", orderNumber],
    queryFn: () => apiGet<StorePaymentStatusResponse>(`/store/payments/${orderNumber}/status`).then((response) => response.data),
    enabled: !!orderNumber && paymentState === "processing" && paymentMethod !== "credits",
    refetchInterval: paymentState === "processing" && paymentMethod !== "credits" ? 3000 : false,
  });

  const createOrder = useMutation({
    mutationFn: async () => {
      const response = await apiPost<CreateOrderResponse>("/store/orders", {
        payment_method: paymentMethod === "credits" ? "credits" : "mobile_money",
        phone_number: paymentMethod === "credits" ? undefined : formattedPaymentPhone,
        provider: undefined,
        shipping_address: {
          ...shippingAddress,
          address_line_2: shippingAddress.address_line_2 || undefined,
          postal_code: shippingAddress.postal_code || undefined,
        },
        notes: notes.trim() || undefined,
      });

      return response.data;
    },
  });

  const initiateStorePayment = useMutation({
    mutationFn: async (currentOrderNumber: string) => {
      const response = await apiPost<StorePaymentResponse>(`/store/payments/${currentOrderNumber}/initiate`, {
        payment_method: paymentMethod === "credits" ? "credits" : "zengapay",
        phone_number: paymentMethod === "credits" ? undefined : formattedPaymentPhone,
      });

      return response.data;
    },
  });

  useEffect(() => {
    if (!paymentStatusQuery.data) {
      return;
    }

    if (paymentStatusQuery.data.payment_status === "paid") {
      setPaymentState("success");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment confirmed. Your order is ready.");
      return;
    }

    if (paymentStatusQuery.data.payment_status === "failed") {
      setPaymentState("failed");
      toast.error("Store payment failed. You can retry from this screen.");
    }
  }, [paymentStatusQuery.data, queryClient]);

  useEffect(() => {
    if (!cartLoading && !cart?.items.length) {
      router.replace("/store/cart");
    }
  }, [cart?.items.length, cartLoading, router]);

  const validateAddressStep = () => {
    const requiredFields: Array<keyof ShippingAddress> = [
      "full_name",
      "phone",
      "address_line_1",
      "city",
      "district",
    ];

    const missingField = requiredFields.find((field) => !shippingAddress[field].trim());
    if (missingField) {
      toast.error("Please complete the shipping address first.");
      return false;
    }

    return true;
  };

  const validatePaymentStep = () => {
    if (paymentMethod === "credits") {
      return true;
    }

    if (!formattedPaymentPhone || formattedPaymentPhone.length !== 12) {
      toast.error("Enter a valid Ugandan phone number for mobile money.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddressStep() || !validatePaymentStep()) {
      return;
    }

    setPaymentState("processing");

    try {
      const createdOrder = await createOrder.mutateAsync();
      setOrderNumber(createdOrder.order_number);

      if (paymentMethod === "credits") {
        setPaymentState("success");
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        toast.success("Order placed successfully.");
        return;
      }

      const payment = await initiateStorePayment.mutateAsync(createdOrder.order_number);
      setPaymentReference(payment.payment_reference ?? null);
      toast.info("Check your phone and complete the payment prompt.");
    } catch (error) {
      setPaymentState("failed");
      const message = isApiError(error)
        ? error.response?.data?.message || "Failed to create the order."
        : error instanceof Error
          ? error.message
          : "Failed to create the order.";
      toast.error(message);
    }
  };

  const handleRetry = () => {
    setPaymentState("idle");
    setPaymentReference(null);
    if (orderNumber && paymentMethod !== "credits") {
      initiateStorePayment.mutate(orderNumber, {
        onSuccess: (payment) => {
          setPaymentReference(payment.payment_reference ?? null);
          setPaymentState("processing");
        },
        onError: () => {
          setPaymentState("failed");
          toast.error("Could not restart payment for this order.");
        },
      });
      return;
    }

    setOrderNumber(null);
  };

  if (cartLoading || !cart) {
    if (!cartLoading && isError) {
      const isUnauthenticated =
        status === "unauthenticated" ||
        (isApiError(error) && error.response?.status === 401);

      return (
        <div className="container mx-auto py-16 px-4 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">
            {isUnauthenticated ? "Sign in to checkout" : "Checkout unavailable right now"}
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            {isUnauthenticated
              ? "Your Store cart and checkout are linked to your account. Sign in and we’ll bring you straight back here."
              : "We couldn't load your checkout session just now. Please try again in a moment."}
          </p>
          <div className="flex justify-center gap-3">
            {isUnauthenticated ? (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </Link>
            ) : null}
            <Link
              href="/store/cart"
              className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 hover:bg-muted"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return null;
  }

  if (paymentState === "success") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Order Placed Successfully</h2>
          <p className="text-muted-foreground">
            Your order has been created and {paymentMethod === "credits" ? "paid with credits." : "the store payment is complete."}
          </p>
          {orderNumber ? (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold font-mono">{orderNumber}</p>
            </div>
          ) : null}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-xl font-bold">{formatCurrency(cart.total)}</p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            {orderNumber ? (
              <Link
                href={`/store/orders/${orderNumber}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                View Order
              </Link>
            ) : null}
            <Link
              href="/store"
              className="px-6 py-3 border rounded-lg font-medium hover:bg-muted"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentState === "failed") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Checkout Needs Attention</h2>
          <p className="text-muted-foreground">
            The order was not fully completed. You can retry the payment flow or go back and update your details.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Retry
            </button>
            <button
              onClick={() => setPaymentState("idle")}
              className="px-6 py-3 border rounded-lg font-medium hover:bg-muted"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentState === "processing" && orderNumber && paymentMethod !== "credits") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <div className="text-center py-12 space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Awaiting Payment</h2>
          <p className="text-muted-foreground">
            The order is created. Complete the mobile money prompt on your phone and we&apos;ll confirm payment here.
          </p>
          <div className="space-y-3 max-w-xs mx-auto">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Order</p>
              <p className="font-mono font-bold">{orderNumber}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{formatPhoneNumber(formattedPaymentPhone)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Payment Reference</p>
              <p className="font-medium">{paymentReference || "Waiting..."}</p>
            </div>
          </div>
          <button
            onClick={() => setPaymentState("failed")}
            className="text-sm text-muted-foreground hover:underline"
          >
            Stop waiting and retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/store/cart" className="p-2 hover:bg-muted rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {(["address", "payment", "confirm"] as CheckoutStep[]).map((currentStep, index) => {
          const stepIndex = ["address", "payment", "confirm"].indexOf(step);
          const isCompleted = index < stepIndex;
          const isCurrent = step === currentStep;
          const icons = [MapPin, CreditCard, Package];
          const labels = ["Delivery", "Payment", "Confirm"];
          const StepIcon = icons[index];

          return (
            <div key={currentStep} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isCurrent && "bg-primary text-primary-foreground",
                  isCompleted && "bg-green-500 text-white",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
              </div>
              <span className={cn("hidden sm:block text-sm", isCurrent ? "font-semibold" : "text-muted-foreground")}>
                {labels[index]}
              </span>
              {index < 2 ? <div className="w-6 sm:w-12 h-px bg-border" /> : null}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === "address" ? (
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">Full name</span>
                  <input
                    value={shippingAddress.full_name}
                    onChange={(event) => setShippingAddress((current) => ({ ...current, full_name: event.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-3"
                    placeholder="Full name"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Phone</span>
                  <input
                    value={shippingAddress.phone}
                    onChange={(event) => setShippingAddress((current) => ({ ...current, phone: event.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-3"
                    placeholder="0772 123 456"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">City</span>
                  <input
                    value={shippingAddress.city}
                    onChange={(event) => setShippingAddress((current) => ({ ...current, city: event.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-3"
                    placeholder="Soroti"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">Address line 1</span>
                  <input
                    value={shippingAddress.address_line_1}
                    onChange={(event) => setShippingAddress((current) => ({ ...current, address_line_1: event.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-3"
                    placeholder="Street, stage, building"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">Address line 2</span>
                  <input
                    value={shippingAddress.address_line_2}
                    onChange={(event) => setShippingAddress((current) => ({ ...current, address_line_2: event.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-3"
                    placeholder="Apartment, suite, landmark"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">District</span>
                  <input
                    value={shippingAddress.district}
                    onChange={(event) => setShippingAddress((current) => ({ ...current, district: event.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-3"
                    placeholder="Soroti"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Postal code</span>
                  <input
                    value={shippingAddress.postal_code}
                    onChange={(event) => setShippingAddress((current) => ({ ...current, postal_code: event.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-3"
                    placeholder="Optional"
                  />
                </label>
              </div>

              <button
                onClick={() => {
                  if (!validateAddressStep()) return;
                  setStep("payment");
                }}
                className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          ) : null}

          {step === "payment" ? (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border transition-colors",
                        paymentMethod === method.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", method.color, method.textColor)}>
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      {paymentMethod === method.id ? (
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-3">Order Notes</h2>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Delivery or pickup notes"
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg bg-background resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("address")}
                  className="flex-1 py-3 border rounded-lg hover:bg-muted font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!validatePaymentStep()) return;
                    setStep("confirm");
                  }}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  Review Order
                </button>
              </div>
            </div>
          ) : null}

          {step === "confirm" ? (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </h2>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{getStoreProductName(item.product)}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">
                        {formatCurrency((item.price_ugx ?? item.price ?? getStoreProductPrice(item.product)) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-bold mb-4">Delivery & Payment</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deliver to</span>
                    <span className="font-medium text-right">
                      {shippingAddress.full_name}, {shippingAddress.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{formatPhoneNumber(formattedPaymentPhone || shippingAddress.phone)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">{PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.name}</span>
                  </div>
                  {notes ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notes</span>
                      <span className="font-medium text-right max-w-[220px] truncate">{notes}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Store payment flow</p>
                  <p className="text-muted-foreground">
                    This checkout now follows the live Store order API first, then the Store payment API.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("payment")}
                  className="flex-1 py-3 border rounded-lg hover:bg-muted font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={createOrder.isPending || initiateStorePayment.isPending}
                  className={cn(
                    "flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors",
                    createOrder.isPending || initiateStorePayment.isPending
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {createOrder.isPending || initiateStorePayment.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Place Order • {formatCurrency(cart.total)}</>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate flex-1">
                    {getStoreProductName(item.product)} × {item.quantity}
                  </span>
                  <span className="shrink-0">
                    {formatCurrency((item.price_ugx ?? item.price ?? getStoreProductPrice(item.product)) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{cart.shipping === 0 ? "Free" : formatCurrency(cart.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(cart.tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cart.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
