// app/_layout.js
import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';


export default function Layout() {


  return (
    <CartProvider>
      <OrderProvider>
        <Slot />
      </OrderProvider>
    </CartProvider>
  );
}
