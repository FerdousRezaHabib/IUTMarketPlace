import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, ImageOff } from "lucide-react";
import * as productsApi from "../api/products";
import * as reviewsApi from "../api/reviews";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  async function loadProduct() {
    setLoading(true);
    setError("");
    try {
      const data = await productsApi.getProduct(id);
      setProduct(data);
    } catch {
      setError("Could not load this product.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddToCart() {
    setAddingToCart(true);
    setCartMessage("");
    try {
      await addItem(product.id, 1);
      setCartMessage("Added to cart.");
    } catch {
      setCartMessage("Could not add to cart.");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await reviewsApi.submitReview({ productId: Number(id), rating, comment });
      setComment("");
      await loadProduct();
    } catch {
      setReviewError("Could not submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-red-600">{error}</p>;
  if (!product) return null;

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-50">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-lg object-cover" />
          ) : (
            <ImageOff size={48} className="text-gray-300" />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wide text-gray-500">{product.category}</span>
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          {product.averageRating != null && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              {product.averageRating.toFixed(1)} ({product.reviews.length} review
              {product.reviews.length === 1 ? "" : "s"})
            </div>
          )}
          <p className="text-2xl font-semibold text-gray-900">${Number(product.price).toFixed(2)}</p>
          <p className="text-sm text-gray-600">{product.description}</p>

          {outOfStock ? (
            <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
              Out of stock
            </span>
          ) : (
            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {product.stockQuantity} in stock
            </span>
          )}

          {!isAdmin &&
            (user ? (
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || addingToCart}
                className="mt-2 w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "Add to cart"}
              </button>
            ) : (
              <p className="text-sm text-gray-500">Log in to add this to your cart.</p>
            ))}
          {cartMessage && <p className="text-sm text-gray-600">{cartMessage}</p>}
        </div>
      </div>

      <section className="mt-14 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Reviews</h2>

        {product.reviews.length === 0 && (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        )}
        <div className="flex flex-col gap-4">
          {product.reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.rating ? "fill-amber-400" : "fill-none text-gray-300"}
                  />
                ))}
              </div>
              {review.comment && <p className="mt-2 text-sm text-gray-700">{review.comment}</p>}
            </div>
          ))}
        </div>

        {user && !isAdmin && (
          <form onSubmit={handleSubmitReview} className="mt-8 flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-900">Leave a review</h3>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-fit rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r === 1 ? "" : "s"}
                </option>
              ))}
            </select>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment"
              rows={3}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="w-fit rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {reviewSubmitting ? "Submitting..." : "Submit review"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
