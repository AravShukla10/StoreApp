import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  useEffect(() => {
    const loadCart = async () => {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) setCart(JSON.parse(stored));
    };
    loadCart();
  }, []);

  const updateCart = async (itemName, change) => {
    const updated = { ...cart };
    updated[itemName] = (updated[itemName] || 0) + change;
    if (updated[itemName] <= 0) delete updated[itemName];

    setCart(updated);
    await AsyncStorage.setItem('cart', JSON.stringify(updated));
  };

  return (
    <CartContext.Provider value={{ cart, updateCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
