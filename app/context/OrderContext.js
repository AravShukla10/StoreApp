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

  // Modify placeOrder to accept userId, token, and orderData for backend API call
  const placeOrder = async (userId, token, orderData) => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          shopId: '687631e69d85fbc4f3f85c78', // Assuming a default shop ID for orders as well
          items: orderData, // This should be an array of { itemId, quantity }
          totalAmount: orderData.reduce((sum, item) => {
            // This calculation would ideally use the actual price from fetchedItems
            // For now, it assumes orderData already has a price or calculates based on assumed price
            return sum + (item.price_per_quantity * item.quantity || 0);
          }, 0),
          status: 'Pending',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newOrder = await response.json();
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
      return newOrder;
    } catch (error) {
      console.error("Error placing order via API:", error);
      throw error; // Re-throw to be caught by the caller
    }
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