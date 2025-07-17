import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useCart } from '../context/CartContext'; // adjust path if needed

const BASE_URL = 'http://10.0.2.2:5000'; // Your API base URL
const DEFAULT_SHOP_ID = '687631e69d85fbc4f3f85c78'; // Default shop ID as requested

export default function Home() {
  const { cart, updateCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        // Fetch all items for the default shop
        const response = await fetch(`${BASE_URL}/api/items/shop/${DEFAULT_SHOP_ID}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const itemsData = await response.json();

        setFeaturedItems(itemsData);

        // Extract unique types for categories
        const uniqueTypes = [...new Set(itemsData.map(item => item.type))];
        const formattedCategories = uniqueTypes.map(type => ({
          name: type,
          // You can add static icons here if desired, e.g., icon: require('../../assets/placeholder.jpeg')
        }));
        setCategories(formattedCategories);

      } catch (e) {
        console.error("Failed to fetch shop data:", e);
        setError("Failed to load shop items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Function to sync cart changes with the backend
  const syncCartWithBackend = async (itemName, change) => {
    // Find the item ID from the currently loaded featuredItems based on itemName
    const item = featuredItems.find(i => i.name === itemName);
    if (!item) {
      Alert.alert("Error", "Item not found for cart update.");
      return;
    }

    // Retrieve userId and token from AsyncStorage
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    if (!userId || !token) {
      Alert.alert("Authentication Required", "Please log in to update your cart.");
      console.warn("User ID or Token not found in AsyncStorage. Cannot sync cart.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the authentication token
        },
        body: JSON.stringify({
          itemId: item._id, // Send the backend's item ID
          quantity: change, // Send the change in quantity (+1 for add, -1 for remove)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Cart updated on backend:', responseData.cart);
      // Optionally: if the backend returns the full updated cart, you could use it to
      // re-sync your local cart state, ensuring consistency.
    } catch (apiError) {
      console.error("Failed to sync cart with backend:", apiError);
      Alert.alert("Error", `Failed to update cart on server: ${apiError.message}`);
      // In a real app, you might want to revert the local cart state if the backend update fails
    }
  };

  // Wrapper function to update local cart and then sync with backend
  const handleUpdateCart = (itemName, change) => {
    updateCart(itemName, change); // Update local state first
    syncCartWithBackend(itemName, change); // Then sync with backend
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search items..."
        placeholderTextColor="#888"
      />
      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        {categories.length > 0 ? (
          categories.map((cat, idx) => (
            <TouchableOpacity key={idx} style={styles.categoryCard}>
              {/* <Image source={cat.icon} style={styles.categoryIcon} /> */}
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No categories found for this shop.</Text>
        )}
      </View>
      {/* Featured Items */}
      <Text style={styles.sectionTitle}>Featured Items</Text>
      <View style={styles.featuredContainer}>
        {featuredItems.length > 0 ? (
          featuredItems.map((item) => (
            <View key={item._id} style={styles.featuredCard}>
              <Image 
                source={{ uri: item.imageUrl || 'https://picsum.photos/60/60' }} // Picusm URL as fallback
                style={styles.featuredImage} 
              />
              <Text style={styles.itemName}>{item.name}</Text>
              {/* Display price_per_quantity if available, otherwise quantity_avl as a fallback for price */}
              <Text style={styles.itemPrice}>
                ₹{item.price_per_quantity !== undefined ? item.price_per_quantity : item.quantity_avl}
              </Text>

              {cart[item.name] > 0 ? (
                <View style={styles.counterContainer}>
                  <TouchableOpacity onPress={() => handleUpdateCart(item.name, -1)} style={styles.counterBtn}>
                    <Text style={styles.counterText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{cart[item.name]}</Text>
                  <TouchableOpacity onPress={() => handleUpdateCart(item.name, 1)} style={styles.counterBtn}>
                    <Text style={styles.counterText}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleUpdateCart(item.name, 1)}
                  style={styles.addToCartBtn}
                >
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text>No items found for this shop.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f2f2f2', padding: 16 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchInput: {
    backgroundColor: '#fff', borderRadius: 8, padding: 10,
    fontSize: 16, marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#444' },
  categoriesContainer: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20,
  },
  categoryCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 10,
    padding: 12, alignItems: 'center', marginBottom: 12,
  },
  categoryIcon: { width: 40, height: 40, marginBottom: 8 },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#333' },
  featuredContainer: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  featuredCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 10,
    padding: 12, alignItems: 'center', marginBottom: 12,
  },
  featuredImage: { width: 60, height: 60, marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#222' },
  itemPrice: { fontSize: 14, color: '#555', marginBottom: 10 },
  counterContainer: { flexDirection: 'row', alignItems: 'center' },
  counterBtn: {
    backgroundColor: '#ddd', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  counterText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  counterValue: { fontSize: 16, fontWeight: '600', width: 24, textAlign: 'center' },
  addToCartBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});