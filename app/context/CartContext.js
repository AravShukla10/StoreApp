// context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({}); // cart is an object: { itemName: quantity }

  const updateCart = (itemName, change) => {
    setCart(prevCart => {
      const newQuantity = (prevCart[itemName] || 0) + change;
      if (newQuantity <= 0) {
        const { [itemName]: _, ...rest } = prevCart; // Remove item if quantity is 0 or less
        return rest;
      }
      return {
        ...prevCart,
        [itemName]: newQuantity,
      };
    });
  };

  return (
    <CartContext.Provider value={{ cart, updateCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);