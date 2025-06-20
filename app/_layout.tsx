import { Slot } from 'expo-router';
import { CartProvider } from './context/CartContext'; // adjust path if needed
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