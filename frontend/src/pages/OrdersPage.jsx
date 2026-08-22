import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as ordersApi from "../api/orders";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.listMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">Loading...</p>;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Your Orders</h1>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm"
          >
            <div>
              <p className="font-medium text-gray-900">Order #{order.id}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} · ${Number(order.totalAmount).toFixed(2)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}
            >
              {order.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
