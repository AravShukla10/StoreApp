import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext'; // adjust path if needed
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const BASE_URL = 'http://10.0.2.2:5000'; // Your API base URL
const DEFAULT_SHOP_ID = '687631e69d85fbc4f3f85c78'; // Default shop ID as requested

// Mock data for the new offers section, similar to what you'd get from an API
const mockOffers = [
  {
    id: 'offer1',
    title: '50% Off Vegetables',
    description: 'Limited time deal!',
    icon: 'leaf-outline',
    colors: ['#388E3C', '#66BB6A'],
  },
  {
    id: 'offer2',
    title: 'Free Delivery',
    description: 'On orders over ₹299',
    icon: 'bicycle-outline',
    colors: ['#F4511E', '#FF8A65'],
  },
  {
    id: 'offer3',
    title: '20% Cashback',
    description: 'Pay with digital wallet',
    icon: 'wallet-outline',
    colors: ['#1E88E5', '#64B5F6'],
  },
];


export default function Home() {
  const { cart, updateCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [frequentlyOrderedItems, setFrequentlyOrderedItems] = useState([]);
  const [offers, setOffers] = useState([]); // State for the new offers section
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        // In a real app, you might have separate API calls for each section
        // For now, we fetch all items and then derive the other sections from it.

        // 1. Fetch all items for the shop
        const response = await fetch(`${BASE_URL}/api/items/shop/${DEFAULT_SHOP_ID}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const itemsData = await response.json();
        setFeaturedItems(itemsData);

        // 2. Set Offers Data
        // In a real app, you'd fetch this from `${BASE_URL}/api/offers/shop/${DEFAULT_SHOP_ID}`
        setOffers(mockOffers);

        // 3. Set Frequently Ordered Items (Simulated)
        setFrequentlyOrderedItems(itemsData.slice(0, 5));

        // 4. Set Categories
        const uniqueTypes = [...new Set(itemsData.map(item => item.type))];
        const formattedCategories = uniqueTypes.map(type => ({ name: type }));
        setCategories(formattedCategories);

      } catch (e) {
        console.error("Failed to fetch shop data:", e);
        setError("Failed to load shop items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []);

  const syncCartWithBackend = async (itemName, change) => {
    const allItems = [...featuredItems, ...frequentlyOrderedItems];
    const item = allItems.find(i => i.name === itemName);
    if (!item) {
      Alert.alert("Error", "Item not found for cart update.");
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');

    if (!userId || !token) {
      Alert.alert("Authentication Required", "Please log in to update your cart.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ itemId: item._id, quantity: change }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      console.log('Cart updated on backend');
    } catch (apiError) {
      console.error("Failed to sync cart with backend:", apiError);
      Alert.alert("Error", `Failed to update cart on server: ${apiError.message}`);
    }
  };

  const handleUpdateCart = (itemName, change) => {
    updateCart(itemName, change);
    syncCartWithBackend(itemName, change);
  };

  const CartButtons = ({ item }) => (
    <>
      {cart[item.name] > 0 ? (
        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={() => handleUpdateCart(item.name, -1)} style={styles.counterBtn}><Text style={styles.counterText}>−</Text></TouchableOpacity>
          <Text style={styles.counterValue}>{cart[item.name]}</Text>
          <TouchableOpacity onPress={() => handleUpdateCart(item.name, 1)} style={styles.counterBtn}><Text style={styles.counterText}>+</Text></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => handleUpdateCart(item.name, 1)} style={styles.addToCartBtn}><Text style={styles.addToCartText}>Add</Text></TouchableOpacity>
      )}
    </>
  );

  if (loading) {
    return <View style={[styles.container, styles.centerContent]}><ActivityIndicator size="large" color="#1E88E5" /><Text>Loading items...</Text></View>;
  }

  if (error) {
    return <View style={[styles.container, styles.centerContent]}><Text style={{ color: 'red' }}>{error}</Text></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TextInput style={styles.searchInput} placeholder="Search for groceries, vegetables..." placeholderTextColor="#888" />
      
      {/* Categories Section */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((cat, idx) => <TouchableOpacity key={idx} style={styles.categoryCard}><Text style={styles.categoryText}>{cat.name}</Text></TouchableOpacity>)}
      </View>

      {/* Deals & Offers Section */}
      <Text style={styles.sectionTitle}>Deals & Offers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollContainer}>
        {offers.map((offer) => (
          <TouchableOpacity key={offer.id} activeOpacity={0.8}>
            <LinearGradient colors={offer.colors} style={styles.offerCard}>
              <View style={styles.offerIconContainer}>
                <Ionicons name={offer.icon} size={28} color="#fff" />
              </View>
              <View>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDescription}>{offer.description}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Frequently Ordered Items Section */}
      <Text style={styles.sectionTitle}>Frequently Ordered</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollContainer}>
        {frequentlyOrderedItems.map((item) => (
          <View key={item._id} style={styles.frequentCard}>
            <Image source={{ uri: item.imageUrl || 'https://placehold.co/100x100' }} style={styles.frequentImage} />
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price_per_quantity ?? item.quantity_avl}</Text>
            <CartButtons item={item} />
          </View>
        ))}
      </ScrollView>

      {/* All Items Section */}
      <Text style={styles.sectionTitle}>All Items</Text>
      <View style={styles.featuredContainer}>
        {featuredItems.map((item) => (
          <View key={item._id} style={styles.featuredCard}>
            <Image source={{ uri: item.imageUrl || 'https://placehold.co/120x120' }} style={styles.featuredImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price_per_quantity ?? item.quantity_avl}</Text>
            <CartButtons item={item} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFB', 
    paddingHorizontal: 16 
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  searchInput: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    marginBottom: 24, 
    marginTop: 16, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
   shadowOpacity: 0.05, 
   shadowRadius: 2
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16, 
    color: '#333'
   },
  categoriesContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 24 
  },
  categoryCard: { 
    width: '48%', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 12, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
   shadowOpacity: 0.05, 
   shadowRadius: 2 
  },
  categoryText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#333' 
  },
  horizontalScrollContainer: { 
    marginBottom: 24 
  },
  
  // Styles for the new Offer Cards
  offerCard: {
    width: 280,
    height: 100,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  offerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  offerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  frequentCard: { 
    width: 150, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    alignItems: 'center', 
    marginRight: 16, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  frequentImage: { 
    width: 80, 
    height: 80, 
    marginBottom: 12, 
    borderRadius: 8 
  },
  featuredContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    paddingBottom: 20 
  },
  featuredCard: { 
    width: '48%', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    alignItems: 'center', 
    marginBottom: 16, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
   shadowOpacity: 0.1, 
   shadowRadius: 4 
 },
  featuredImage: { 
    width: 100, 
    height: 100, 
    marginBottom: 12, 
    borderRadius: 8 
  },
  itemName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#222', 
    textAlign: 'center', 
    marginBottom: 4 
  },
  itemPrice: { 
    fontSize: 15, 
    color: '#1E88E5', 
    fontWeight: '700', 
    marginBottom: 12 
  },
  counterContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F0F0', 
    borderRadius: 8 
  },
  counterBtn: { 
    paddingHorizontal: 14, 
    paddingVertical: 8 
  },
  counterText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  counterValue: { 
    fontSize: 16, 
    fontWeight: '600', 
    width: 30, 
    textAlign: 'center', 
    backgroundColor: '#fff', 
    paddingVertical: 8 
  },
  addToCartBtn: { 
    backgroundColor: '#1E88E5', 
    paddingVertical: 10, 
    paddingHorizontal: 30, 
    borderRadius: 8 
  },
  addToCartText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
});
