import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const API_URL = import.meta.env.VITE_API_URL;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [stockWarnings, setStockWarnings] = useState({}); // { productId: availableStock }
  const [isInitialized, setIsInitialized] = useState(false);
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('aasanCart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error('Cart parse error'); }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('aasanCart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // ── Active Stock Validation ───────────────────────────────────────────────
  // Called when cart drawer opens or cart changes. Checks live stock for each item.
  const validateCartStock = useCallback(async () => {
    if (cart.length === 0) { setStockWarnings({}); return; }
    setIsValidatingStock(true);
    const warnings = {};
    try {
      await Promise.all(
        cart.map(async (item) => {
          if (!item.productId) return;
          const res = await fetch(`${API_URL}/api/products/${item.productId}`);
          if (!res.ok) return;
          const product = await res.json();
          if (product.stock < item.quantity) {
            warnings[item.productId] = product.stock; // 0 = out of stock
          }
        })
      );
    } catch (e) {
      console.error('Stock validation error:', e);
    }
    setStockWarnings(warnings);
    setIsValidatingStock(false);
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item =>
        item.productId === product._id &&
        item.selectedColor?.name === selectedColor?.name &&
        item.selectedSize === selectedSize
      );
      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: selectedColor?.images?.[0] || product.images?.[0],
        quantity,
        selectedColor,
        selectedSize,
      }];
    });
  };

  const removeFromCart = (indexToRemove) => {
    setCart(prev => {
      const removed = prev[indexToRemove];
      const newCart = prev.filter((_, idx) => idx !== indexToRemove);
      // Clear any warning for this product
      if (removed?.productId) {
        setStockWarnings(prev => {
          const w = { ...prev };
          delete w[removed.productId];
          return w;
        });
      }
      return newCart;
    });
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(index);
    setCart(prev => {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      return newCart;
    });
  };

  const clearCart = () => { setCart([]); setStockWarnings({}); };

  const getCartTotal = (discount = 0) => {
    const raw = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    return Math.max(0, raw - discount);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Whether any cart item has a stock issue
  const hasStockIssues = Object.keys(stockWarnings).length > 0;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      cartCount,
      stockWarnings,
      isValidatingStock,
      validateCartStock,
      hasStockIssues,
    }}>
      {children}
    </CartContext.Provider>
  );
};
