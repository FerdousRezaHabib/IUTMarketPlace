import { apiClient } from "./client";

export async function listProducts({ category, sort } = {}) {
  const { data } = await apiClient.get("/products", { params: { category, sort } });
  return data;
}

export async function getProduct(id) {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
}

export async function createProduct(product) {
  const { data } = await apiClient.post("/products", product);
  return data;
}

export async function updateProduct(id, product) {
  const { data } = await apiClient.put(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id) {
  await apiClient.delete(`/products/${id}`);
}
