import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const prices = {
  Milk: 30,
  Bread: 25,
  Soap: 20,
};

export default function Cart() {
  const { cart, setCart, updateCart } = useCart();
  const { placeOrder } = useOrders();

  const cartItems = Object.entries(cart).map(([name, quantity]) => ({
    name,
    quantity,
    price: prices[name] || 0,
  }));

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handlePlaceOrder = async () => {
  if (Object.keys(cart).length === 0) return;

  await placeOrder(cart);
  setCart({});
  await AsyncStorage.removeItem('cart');

  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your Order is Being Packed! 📦',
      body: 'We’ll notify you when it’s ready for pickup.',
    },
    trigger: { seconds: 2 },
  });

  Alert.alert('Order Placed', 'You will be notified once it is packed.');
};

const removeItem = (itemName) => {
  updateCart(itemName, -cart[itemName]);
};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Cart</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.name}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>

                <View style={styles.counterContainer}>
  <TouchableOpacity
    onPress={() => updateCart(item.name, -1)}
    style={styles.counterBtn}
  >
    <Text style={styles.counterText}>−</Text>
  </TouchableOpacity>
  <Text style={styles.counterValue}>{item.quantity}</Text>
  <TouchableOpacity
    onPress={() => updateCart(item.name, 1)}
    style={styles.counterBtn}
  >
    <Text style={styles.counterText}>+</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => removeItem(item.name)}
    style={styles.removeBtn}
  >
    <Text style={styles.removeBtnText}>Remove</Text>
  </TouchableOpacity>
</View>

              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{getTotal()}</Text>
            </View>
            <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 40,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 15, fontWeight: '500', color: '#444' },

  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  counterBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  counterText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderColor: '#ccc',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, color: '#555' },
  totalAmount: { fontSize: 18, fontWeight: '700', color: '#000' },

  orderButton: {
    backgroundColor: '#00b140',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  removeBtn: {
  marginLeft: 16,
  paddingHorizontal: 10,
  paddingVertical: 4,
  backgroundColor: '#ff4d4f',
  borderRadius: 6,
},
removeBtnText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 12,
},

});
