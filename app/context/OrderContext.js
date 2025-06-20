import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const stored = await AsyncStorage.getItem('orders');
      if (stored) setOrders(JSON.parse(stored));
    };
    loadOrders();
  }, []);

  const placeOrder = async (cart) => {
    const newOrder = {
      id: Date.now(),
      items: cart,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
    return newOrder;
  };

  const updateOrderStatus = async (id, status) => {
    const updated = orders.map((order) =>
      order.id === id ? { ...order, status } : order
    );
    setOrders(updated);
    await AsyncStorage.setItem('orders', JSON.stringify(updated));
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);