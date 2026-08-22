import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";

export default function ProductCard({ product }) {
  const outOfStock = product.stockQuantity <= 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-square items-center justify-center bg-gray-50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="flex h-full w-full items-center justify-center text-gray-300"
          style={{ display: product.imageUrl ? "none" : "flex" }}
        >
          <ImageOff size={32} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-gray-500">{product.category}</span>
        <h3 className="font-medium text-gray-900 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-gray-900">${Number(product.price).toFixed(2)}</span>
          {outOfStock ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              Out of stock
            </span>
          ) : (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              In stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
