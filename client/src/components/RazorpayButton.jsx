import { useState } from "react";
import api, { getApiError } from "../utils/api";

export default function RazorpayButton({
  claim,
  override = false,
  onSuccess,
  onError,
  children,
  className = "gs-btn-primary !px-4 !py-2 text-sm",
}) {
  const [loading, setLoading] = useState(false);

  const confirmPayout = async ({ order, payment = {} }) => {
    const response = await api.post("/api/payouts/confirm", {
      claimId: claim._id,
      razorpayOrderId: payment.razorpay_order_id || order.id,
      razorpayPaymentId: payment.razorpay_payment_id || `pay_demo_${Date.now()}`,
      razorpaySignature: payment.razorpay_signature || "demo_signature",
    });

    onSuccess?.(response.data.data);
  };

  const handlePayout = async () => {
    setLoading(true);

    try {
      const initiateResponse = await api.post("/api/payouts/initiate", {
        claimId: claim._id,
        workerId: claim.worker_id?._id || claim.worker_id,
        override,
      });
      const { order, razorpayKeyId } = initiateResponse.data.data;

      if (order.mock || !window.Razorpay) {
        await confirmPayout({ order });
        return;
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "GigShield",
        description: `Test payout for ${claim.disruption_type?.replaceAll("_", " ") || "claim"}`,
        order_id: order.id,
        handler: async (payment) => {
          await confirmPayout({ order, payment });
        },
        prefill: {
          name: claim.worker_id?.name || "GigShield Worker",
          email: claim.worker_id?.email || "worker@gigshield.demo",
        },
        notes: {
          claimId: claim._id,
          testCard: "4111 1111 1111 1111",
        },
        theme: {
          color: "#0d9488",
        },
      });

      razorpay.open();
    } catch (error) {
      onError?.(getApiError(error, "Unable to process payout"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" className={className} disabled={loading} onClick={handlePayout}>
      {loading ? "Processing..." : children || "Approve & Pay"}
    </button>
  );
}
