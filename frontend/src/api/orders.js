import { apiClient } from "./client";

export async function placeOrder() {
  const { data } = await apiClient.post("/orders");
  return data;
}

export async function listMyOrders() {
  const { data } = await apiClient.get("/orders");
  return data;
}

export async function getOrder(id) {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await apiClient.put(`/orders/${id}/status`, { status });
  return data;
}
