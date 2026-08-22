import { useEffect, useState } from "react";
import * as adminApi from "../api/admin";
import * as productsApi from "../api/products";
import * as ordersApi from "../api/orders";

const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  stockQuantity: "",
};

export default function AdminPage() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState(null);

  async function loadAll() {
    setLoading(true);
    const [productsData, ordersData] = await Promise.all([
      adminApi.listAllProducts(),
      adminApi.listAllOrders(),
    ]);
    setProducts(productsData);
    setOrders(ordersData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl ?? "",
      stockQuantity: product.stockQuantity,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyProductForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
    };
    if (editingId) {
      await productsApi.updateProduct(editingId, payload);
    } else {
      await productsApi.createProduct(payload);
    }
    resetForm();
    await loadAll();
  }

  async function handleDelete(id) {
    await productsApi.deleteProduct(id);
    await loadAll();
  }

  async function handleStatusChange(orderId, status) {
    await ordersApi.updateOrderStatus(orderId, status);
    await loadAll();
  }

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

      <div className="mb-8 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("products")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "products" ? "border-accent text-accent" : "border-transparent text-gray-500"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "orders" ? "border-accent text-accent" : "border-transparent text-gray-500"
          }`}
        >
          Orders
        </button>
      </div>

      {tab === "products" && (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:col-span-1">
            <h2 className="text-sm font-medium text-gray-900">
              {editingId ? "Edit product" : "New product"}
            </h2>
            {["name", "description", "category", "imageUrl"].map((field) => (
              <input
                key={field}
                placeholder={field}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required={field === "name" || field === "category"}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            ))}
            <input
              type="number"
              step="0.01"
              placeholder="price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              type="number"
              placeholder="stock quantity"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                {editingId ? "Save" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-3 md:col-span-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.category} · ${Number(product.price).toFixed(2)} · stock {product.stockQuantity}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(product)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500">${Number(order.totalAmount).toFixed(2)}</p>
              </div>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
