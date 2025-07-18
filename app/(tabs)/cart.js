import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:5000';

export default function Cart() {
  const { cart, updateCart, setCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [detailedFetchedCart, setDetailedFetchedCart] = useState([]);

  const fetchUserCartUpdated = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedUserId || !storedToken) {
        setLoading(false);
        return;
      }
      setUserId(storedUserId);
      setToken(storedToken);

      const response = await fetch(`${BASE_URL}/api/users/${storedUserId}/cart`, {
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const backendCart = await response.json();
      setDetailedFetchedCart(backendCart);

      const formattedCart = backendCart.reduce((acc, item) => {
        if (item.itemId && item.itemId.name) {
          acc[item.itemId.name] = item.quantity;
        }
        return acc;
      }, {});
      setCart(formattedCart);
    } catch (e) {
      setError(`Failed to load cart: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [setCart]);

  useFocusEffect(useCallback(() => { fetchUserCartUpdated(); }, [fetchUserCartUpdated]));

  const handleCheckout = async () => {
    if (!userId || !token || detailedFetchedCart.length === 0) {
      Alert.alert("Checkout Failed", "Your cart is empty or you are not logged in.");
      return;
    }

    setLoading(true);
    try {
      const ordersByShop = detailedFetchedCart.reduce((acc, cartItem) => {
        const shopId = cartItem.itemId.shopId;
        if (!acc[shopId]) {
          acc[shopId] = [];
        }
        acc[shopId].push({
          itemId: cartItem.itemId._id,
          quantity: cartItem.quantity,
        });
        return acc;
      }, {});

      const bookingPromises = Object.entries(ordersByShop).map(([shopId, items]) => {
        const bookingData = {
          userId,
          shopId,
          items,
          notes: "Placed from mobile app",
        };

        return fetch(`${BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to create order for shop ${shopId}.`);
        });
      });

      await Promise.all(bookingPromises);

      const clearCartResponse = await fetch(`${BASE_URL}/api/users/${userId}/cart`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!clearCartResponse.ok) {
        throw new Error('Orders placed, but failed to clear the cart.');
      }

      setDetailedFetchedCart([]);
      setCart({});

      Alert.alert("Order Placed!", "Your order has been successfully placed.");

    } catch (checkoutError) {
      Alert.alert("Error", `Checkout failed: ${checkoutError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncCartWithBackend = async (itemId, change) => {
    if (!userId || !token) return;
    try {
      await fetch(`${BASE_URL}/api/users/${userId}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, quantity: change }),
      });
      fetchUserCartUpdated();
    } catch (apiError) {
      Alert.alert("Error", `Failed to update cart: ${apiError.message}`);
    }
  };

  const handleQuantityChangeUpdated = (itemDetails, change) => {
    updateCart(itemDetails.name, change);
    syncCartWithBackend(itemDetails._id, change);
  };

  const calculateTotalUpdated = () => {
    return detailedFetchedCart.reduce((total, cartItem) => {
      const price = cartItem.itemId?.price_per_quantity || 0;
      return total + (price * cartItem.quantity);
    }, 0).toFixed(2);
  };


  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContent}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={fetchUserCartUpdated} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Shopping Cart</Text>

      {detailedFetchedCart.length > 0 ? (
        detailedFetchedCart.map((cartItem) => {
          const itemPrice = cartItem.itemId?.price_per_quantity || 0;
          return cartItem.itemId ? (
            <View key={cartItem.itemId._id} style={styles.cartItemCard}>
              <Image
                source={{ uri: cartItem.itemId.imageUrl || 'https://picsum.photos/70/70' }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{cartItem.itemId.name}</Text>
                <Text style={styles.itemPrice}>₹{itemPrice.toFixed(2)}</Text>
                <Text style={styles.itemSubtotal}>Subtotal: ₹{(itemPrice * cartItem.quantity).toFixed(2)}</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  onPress={() => handleQuantityChangeUpdated(cartItem.itemId, -1)}
                  style={styles.counterBtn}
                >
                  <Text style={styles.counterText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{cartItem.quantity}</Text>
                <TouchableOpacity
                  onPress={() => handleQuantityChangeUpdated(cartItem.itemId, 1)}
                  style={styles.counterBtn}
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        })
      ) : (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty!</Text>
        </View>
      )}

      {detailedFetchedCart.length > 0 && (
        <>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalValue}>₹{calculateTotalUpdated()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Place Order</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 16 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  cartItemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, alignItems: 'center', elevation: 3 },
  itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 18, fontWeight: '600', color: '#222', marginBottom: 4 },
  itemPrice: { fontSize: 16, color: '#555', marginBottom: 4 },
  itemSubtotal: { fontSize: 15, fontWeight: 'bold', color: '#444' },
  counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8 },
  counterBtn: { backgroundColor: '#ddd', borderRadius: 5, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  counterText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  counterValue: { fontSize: 18, fontWeight: '600', width: 30, textAlign: 'center', color: '#333' },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
  totalText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#28a745' },
  checkoutButton: { backgroundColor: '#28a745', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 30, elevation: 5 },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  emptyCartText: { fontSize: 20, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  retryButton: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 20 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});