import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as ordersApi from "../api/orders";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    ordersApi
      .getOrder(id)
      .then(setOrder)
      .catch(() => setError("Could not load this order."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-red-600">{error}</p>;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}
        >
          {order.status}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <span className="text-sm text-gray-700">
              Product #{item.productId} × {item.quantity}
            </span>
            <span className="font-medium text-gray-900">
              ${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <span className="text-sm text-gray-500">
          Placed {new Date(order.createdAt).toLocaleString()}
        </span>
        <span className="text-lg font-semibold text-gray-900">
          Total: ${Number(order.totalAmount).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
