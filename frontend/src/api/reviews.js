import { reviewsApiClient } from "./reviewsClient";

export async function submitReview({ productId, rating, comment }) {
  const { data } = await reviewsApiClient.post("/reviews", { productId, rating, comment });
  return data;
}
