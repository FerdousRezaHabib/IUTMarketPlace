import { apiClient } from "./client";

export async function listAllProducts() {
  const { data } = await apiClient.get("/admin/products");
  return data;
}

export async function listAllOrders() {
  const { data } = await apiClient.get("/admin/orders");
  return data;
}
