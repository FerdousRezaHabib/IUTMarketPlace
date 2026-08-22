import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as cartApi from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const data = await cartApi.getCart();
    setItems(data);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(productId, quantity) {
    await cartApi.addToCart({ productId, quantity });
    await refresh();
  }

  async function removeItem(cartItemId) {
    await cartApi.removeFromCart(cartItemId);
    await refresh();
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, addItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
