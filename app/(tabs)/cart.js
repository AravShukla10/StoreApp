import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'Milk', quantity: 2, price: 30 },
    { id: '2', name: 'Bread', quantity: 1, price: 25 },
    { id: '3', name: 'Soap', quantity: 3, price: 20 },
  ]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    Alert.alert('Success', 'Your order has been placed!');
    setCartItems([]); // Clear cart
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetails}>Qty: {item.quantity}</Text>
      <Text style={styles.itemDetails}>Price: ₹{item.price}</Text>
      <Text style={styles.itemDetails}>
        Total: ₹{item.quantity * item.price}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyCart}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₹{totalAmount}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#555',
  },
  emptyCart: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
  list: {
    paddingBottom: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 12,
    marginTop: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
