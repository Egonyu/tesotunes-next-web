"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  MapPin,
  CheckCircle,
  Loader2,
  Smartphone,
  AlertCircle,
  Shield,
  ChevronLeft,
  Check,
  Package,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  useInitiatePayment,
  usePaymentStatus,
  detectProvider,
  formatPhoneNumber,
} from "@/hooks/usePayments";
import { toast } from "sonner";

interface CartItem {
  id: number;
  quantity: number;
  product: { id: number; title: string; price: number; image_url?: string };
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  district: string;
  is_default: boolean;
}

type PaymentMethodId = "mtn_momo" | "airtel_money" | "wallet";
type CheckoutStep = "address" | "payment" | "confirm";
type PaymentState = "idle" | "processing" | "success" | "failed";

const PAYMENT_METHODS = [
  {
    id: "mtn_momo" as PaymentMethodId,
    name: "MTN Mobile Money",
    description: "Pay with MTN MoMo",
    color: "bg-[#FFCC00]",
    textColor: "text-black",
    icon: Smartphone,
  },
  {
    id: "airtel_money" as PaymentMethodId,
    name: "Airtel Money",
    description: "Pay with Airtel Money",
    color: "bg-[#E40000]",
    textColor: "text-white",
    icon: Smartphone,
  },
  {
    id: "wallet" as PaymentMethodId,
    name: "TesoTunes Wallet",
    description: "Pay from your wallet balance",
    color: "bg-primary",
    textColor: "text-primary-foreground",
    icon: CreditCard,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Checkout wizard state
  const [step, setStep] = useState<CheckoutStep>("address");
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("mtn_momo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Payment processing state
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Data queries
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => apiGet<Cart>("/api/store/cart"),
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiGet<Address[]>("/api/store/addresses"),
  });

  // Payment initiation
  const initiatePayment = useInitiatePayment();

  // Payment status polling - only when processing mobile money
  const { data: paymentStatus } = usePaymentStatus(transactionRef || "", {
    enabled: !!transactionRef && paymentState === "processing",
    refetchInterval: transactionRef && paymentState === "processing" ? 3000 : undefined,
  });

  // Place order mutation (for wallet payments or after MoMo confirmation)
  const placeOrder = useMutation({
    mutationFn: (data: {
      address_id: number;
      payment_method: string;
      phone?: string;
      notes?: string;
      payment_reference?: string;
    }) => apiPost<{ order_number: string }>("/api/store/checkout", data),
    onSuccess: (data) => {
      setOrderNumber(data.order_number);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  // Watch payment status for MoMo completion
  useEffect(() => {
    if (!paymentStatus) return;

    if (paymentStatus.status === "completed") {
      setPaymentState("success");
      toast.success("Payment confirmed! Your order has been placed.");
      // Auto-place the order now that payment is confirmed
      if (selectedAddress && transactionRef) {
        placeOrder.mutate({
          address_id: selectedAddress,
          payment_method: paymentMethod,
          phone: phoneNumber,
          notes: notes || undefined,
          payment_reference: transactionRef,
        });
      }
    } else if (paymentStatus.status === "failed" || paymentStatus.status === "expired") {
      setPaymentState("failed");
      toast.error("Payment failed. Please try again.");
    }
  }, [paymentStatus?.status]);

  const isLoading = cartLoading || addressesLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    router.push("/store/cart");
    return null;
  }

  // Validate phone for mobile money
  const validatePhone = (): boolean => {
    if (paymentMethod === "wallet") return true;

    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 9) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    const detected = detectProvider(cleaned);
    if (detected !== paymentMethod && detected !== "unknown") {
      const providerName = detected === "mtn_momo" ? "MTN" : "Airtel";
      toast.error(
        `This phone number appears to be ${providerName}. Please select the correct payment method.`
      );
      return false;
    }
    return true;
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!validatePhone()) return;

    // Wallet payment - direct checkout
    if (paymentMethod === "wallet") {
      setPaymentState("processing");
      try {
        const result = await placeOrder.mutateAsync({
          address_id: selectedAddress,
          payment_method: "wallet",
          notes: notes || undefined,
        });
        setOrderNumber(result.order_number);
        setPaymentState("success");
        toast.success("Order placed successfully!");
      } catch {
        setPaymentState("failed");
        toast.error("Failed to place order. Please try again.");
      }
      return;
    }

    // Mobile Money payment - initiate then poll
    setPaymentState("processing");
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await initiatePayment.mutateAsync({
        phone: formattedPhone,
        amount: cart.total,
        purpose: "purchase",
        item_id: String(selectedAddress), // Will be mapped by backend
        item_type: "store_order",
      });

      if (result.reference) {
        setTransactionRef(result.reference);
        toast.info("Please check your phone and enter your PIN to confirm payment");
      }
    } catch {
      setPaymentState("failed");
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const handleRetry = () => {
    setPaymentState("idle");
    setTransactionRef(null);
    setOrderNumber(null);
  };

  // =====================================================================
  // Payment State Screens
  // =====================================================================

  // Success Screen
  if (paymentState === "success") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Order Placed Successfully!</h2>
          <p className="text-muted-foreground">
            Your payment has been confirmed and your order is being processed.
          </p>
          {orderNumber && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold font-mono">{orderNumber}</p>
            </div>
          )}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="text-xl font-bold">{formatCurrency(cart?.total || 0)}</p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            {orderNumber && (
              <Link
                href={`/store/orders/${orderNumber}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                View Order
              </Link>
            )}
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

  // Failed Screen
  if (paymentState === "failed") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Payment Failed</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t process your payment. This could be due to insufficient balance
            or a cancelled transaction.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Try Again
            </button>
            <Link
              href="/store/cart"
              className="px-6 py-3 border rounded-lg font-medium hover:bg-muted"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Processing / Awaiting Payment Screen
  if (paymentState === "processing" && transactionRef) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-lg">
        <div className="text-center py-12 space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Awaiting Payment</h2>
          <p className="text-muted-foreground">
            A payment prompt has been sent to your phone. Please enter your PIN to confirm.
          </p>

          <div className="space-y-3 max-w-xs mx-auto">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-xl font-bold">{formatCurrency(cart?.total || 0)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{formatPhoneNumber(phoneNumber)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                <p className="font-medium text-yellow-600">
                  {paymentStatus?.status === "processing" ? "Processing..." : "Waiting for confirmation..."}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="text-sm text-muted-foreground hover:underline"
          >
            Cancel and try again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================================
  // Main Checkout Wizard
  // =====================================================================
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/store/cart" className="p-2 hover:bg-muted rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {(["address", "payment", "confirm"] as CheckoutStep[]).map((s, i) => {
          const stepIndex = ["address", "payment", "confirm"].indexOf(step);
          const isCompleted = i < stepIndex;
          const isCurrent = step === s;
          const icons = [MapPin, CreditCard, Package];
          const labels = ["Delivery", "Payment", "Confirm"];
          const StepIcon = icons[i];

          return (
            <div key={s} className="flex items-center gap-2">
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
                {labels[i]}
              </span>
              {i < 2 && <div className="w-6 sm:w-12 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          {step === "address" && (
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>

              {!addresses?.length ? (
                <div className="text-center py-8">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No saved addresses</p>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={cn(
                        "flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary",
                        selectedAddress === addr.id && "border-primary bg-primary/5"
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{addr.name}</p>
                          {addr.is_default && (
                            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.phone}</p>
                        <p className="text-sm text-muted-foreground">
                          {addr.address_line_1}
                          {addr.address_line_2 && `, ${addr.address_line_2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.city}, {addr.district}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep("payment")}
                disabled={!selectedAddress}
                className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && (
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
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            method.color,
                            method.textColor
                          )}
                        >
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number for Mobile Money */}
              {(paymentMethod === "mtn_momo" || paymentMethod === "airtel_money") && (
                <div className="bg-card rounded-xl border p-6">
                  <h2 className="font-semibold mb-3">Mobile Money Number</h2>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={paymentMethod === "mtn_momo" ? "e.g., 0772 123 456" : "e.g., 0701 234 567"}
                    className="w-full px-4 py-3 rounded-lg border bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You will receive a prompt on this number to confirm payment
                  </p>
                </div>
              )}

              {/* Order Notes */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-3">Order Notes (Optional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for delivery..."
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
                  onClick={() => setStep("confirm")}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <div className="space-y-6">
              {/* Order Items */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </h2>
                <div className="space-y-3">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.product.title}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment Summary */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-bold mb-4">Delivery & Payment</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery to</span>
                    <span className="font-medium text-right">
                      {addresses?.find((a) => a.id === selectedAddress)?.name},{" "}
                      {addresses?.find((a) => a.id === selectedAddress)?.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
                    </span>
                  </div>
                  {(paymentMethod === "mtn_momo" || paymentMethod === "airtel_money") && phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
                    </div>
                  )}
                  {notes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notes</span>
                      <span className="font-medium text-right max-w-[200px] truncate">{notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-muted-foreground">
                    Your payment is processed securely via {paymentMethod === "wallet" ? "your TesoTunes Wallet" : "ZengaPay"}
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
                  disabled={paymentState === "processing" || placeOrder.isPending}
                  className={cn(
                    "flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors",
                    paymentState === "processing" || placeOrder.isPending
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {paymentState === "processing" || placeOrder.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order • {formatCurrency(cart?.total || 0)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              {cart?.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate flex-1">
                    {item.product.title} × {item.quantity}
                  </span>
                  <span className="shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cart?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{cart?.shipping === 0 ? "Free" : formatCurrency(cart?.shipping || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(cart?.tax || 0)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cart?.total || 0)}</span>
              </div>
            </div>

            {/* Payment method indicator */}
            {paymentMethod && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Paying with</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.color,
                    PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.textColor
                  )}>
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">
                    {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
