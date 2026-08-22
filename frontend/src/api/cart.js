import { apiClient } from "./client";

export async function getCart() {
  const { data } = await apiClient.get("/cart");
  return data;
}

export async function addToCart({ productId, quantity }) {
  const { data } = await apiClient.post("/cart/items", { productId, quantity });
  return data;
}

export async function removeFromCart(cartItemId) {
  await apiClient.delete(`/cart/items/${cartItemId}`);
}
