import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import * as ordersApi from "../api/orders";

export default function CartPage() {
  const { items, refresh, removeItem } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  async function handleCheckout() {
    setPlacing(true);
    setError("");
    try {
      const order = await ordersApi.placeOrder();
      await refresh();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Your Cart</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div>
              <p className="font-medium text-gray-900">{item.productName}</p>
              <p className="text-sm text-gray-500">
                {item.quantity} × ${Number(item.price).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900">${Number(item.subtotal).toFixed(2)}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 transition-colors hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <span className="text-lg font-semibold text-gray-900">Total: ${total.toFixed(2)}</span>
        <button
          onClick={handleCheckout}
          disabled={placing}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {placing ? "Placing order..." : "Checkout"}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
