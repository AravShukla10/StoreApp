import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext'; // Adjust path if needed

const BASE_URL = 'http://10.0.2.2:5000'; // Your API base URL

export default function Cart() {
  const { cart, updateCart, setCart } = useCart(); // Get cart, updateCart, and setCart from context
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  // State to store the detailed cart items fetched from the backend
  const [detailedFetchedCart, setDetailedFetchedCart] = useState([]);

  // Function to fetch the user's cart from the backend
  const fetchUserCartUpdated = useCallback(async () => {
    console.log("fetchUserCartUpdated: Starting fetch...");
    setLoading(true);
    setError(null);
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedToken = await AsyncStorage.getItem('token');
      console.log("fetchUserCartUpdated: Stored userId:", storedUserId);
      console.log("fetchUserCartUpdated: Stored token:", storedToken ? "Exists" : "Does not exist");


      if (!storedUserId || !storedToken) {
        Alert.alert("Authentication Required", "Please log in to view your cart.");
        setLoading(false);
        console.warn("fetchUserCartUpdated: User ID or Token not found. Cannot fetch cart.");
        return;
      }

      setUserId(storedUserId);
      setToken(storedToken);

      const response = await fetch(`${BASE_URL}/api/users/${storedUserId}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      console.log("fetchUserCartUpdated: API Response Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("fetchUserCartUpdated: API Error Data:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const backendCart = await response.json();
      console.log("fetchUserCartUpdated: Fetched backend cart:", JSON.stringify(backendCart, null, 2));
      setDetailedFetchedCart(backendCart); // Store the detailed cart items
      
      // Also update the context's cart for consistency with other components
      const formattedCart = backendCart.reduce((acc, item) => {
        if (item.itemId && item.itemId.name) { // Ensure itemId and its name exist
          acc[item.itemId.name] = item.quantity;
        }
        return acc;
      }, {});
      setCart(formattedCart);
      console.log("fetchUserCartUpdated: Cart context updated to:", JSON.stringify(formattedCart, null, 2));

    } catch (e) {
      console.error("fetchUserCartUpdated: Failed to fetch user cart:", e);
      setError(`Failed to load cart: ${e.message}`);
    } finally {
      setLoading(false);
      console.log("fetchUserCartUpdated: Fetch complete.");
    }
  }, [setCart]); // Depend on setCart to avoid re-creating unnecessarily

  useEffect(() => {
    fetchUserCartUpdated();
  }, [fetchUserCartUpdated]); // Re-fetch when fetchUserCartUpdated changes

  // Function to sync cart changes (add/remove/update quantity) with the backend
  const syncCartWithBackend = async (itemId, change) => {
    console.log("syncCartWithBackend: Syncing item ID:", itemId, "change:", change);
    if (!userId || !token) {
      Alert.alert("Authentication Required", "Please log in to update your cart.");
      console.warn("syncCartWithBackend: User ID or Token not found. Cannot sync cart.");
      return;
    }

    try {
      const requestBody = {
        itemId: itemId,
        quantity: change,
      };
      console.log("syncCartWithBackend: Request Body:", JSON.stringify(requestBody));

      const response = await fetch(`${BASE_URL}/api/users/${userId}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("syncCartWithBackend: API Response Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("syncCartWithBackend: API Error Data:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('syncCartWithBackend: Cart updated on backend, response:', JSON.stringify(responseData.cart, null, 2));
      
      // Crucial: Re-fetch the entire cart from the backend to ensure UI consistency
      fetchUserCartUpdated(); 
      console.log("syncCartWithBackend: Initiated re-fetch of cart after successful sync.");

    } catch (apiError) {
      console.error("syncCartWithBackend: Failed to sync cart with backend:", apiError);
      Alert.alert("Error", `Failed to update cart on server: ${apiError.message}`);
    }
  };

  // Handle quantity change for an item
  const handleQuantityChangeUpdated = (itemDetails, change) => {
    console.log("handleQuantityChangeUpdated: Item:", itemDetails.name, "Change:", change);
    // Update local context first for immediate UI feedback
    updateCart(itemDetails.name, change);
    // Then sync with backend using the item's _id
    syncCartWithBackend(itemDetails._id, change);
  };

  // Calculate total price using detailedFetchedCart
  const calculateTotalUpdated = () => {
    let total = 0;
    detailedFetchedCart.forEach(cartItem => {
      // Ensure itemId and its price_per_quantity exist
      if (cartItem.itemId && cartItem.itemId.price_per_quantity !== undefined && cartItem.quantity !== undefined) {
        total += cartItem.itemId.price_per_quantity * cartItem.quantity;
      }
    });
    return total.toFixed(2);
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
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
        detailedFetchedCart.map((cartItem) => (
          // Ensure cartItem.itemId exists before rendering
          cartItem.itemId ? (
            <View key={cartItem.itemId._id} style={styles.cartItemCard}>
              <Image
                source={{ uri: cartItem.itemId.imageUrl || 'https://picsum.photos/60/60' }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{cartItem.itemId.name}</Text>
                <Text style={styles.itemPrice}>
                  ₹{cartItem.itemId.price_per_quantity !== undefined ? cartItem.itemId.price_per_quantity : 'N/A'}
                </Text>
                <Text style={styles.itemSubtotal}>
                  Subtotal: ₹{(cartItem.itemId.price_per_quantity * cartItem.quantity).toFixed(2)}
                </Text>
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
          ) : null // Don't render if itemId is missing
        ))
      ) : (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty!</Text>
          <Text style={styles.emptyCartSubText}>Start adding some delicious items.</Text>
        </View>
      )}

      {detailedFetchedCart.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalValue}>₹{calculateTotalUpdated()}</Text>
        </View>
      )}

      {detailedFetchedCart.length > 0 && (
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#eee', // Placeholder background
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  counterBtn: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyCartSubText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
