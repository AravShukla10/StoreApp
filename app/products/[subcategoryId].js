import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
// If your CartContext is ready, you can uncomment these lines
// import { useCart } from '../../context/CartContext'; 

// This is the full ItemCard component with quantity controls
const ItemCard = ({ item }) => {
  // const { cart, updateCart } = useCart();
  // const quantityInCart = cart[item.name] || 0;
  const quantityInCart = 0; // Placeholder until CartContext is connected

  const handleAddToCart = () => {
    // updateCart(item.name, 1);
    console.log(`Added ${item.name} to cart.`);
  };

  const handleQuantityChange = (change) => {
    // updateCart(item.name, change);
    console.log(`Changed quantity of ${item.name} by ${change}.`);
  };

  return (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/80x80/e2e8f0/e2e8f0' }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price_per_quantity?.toFixed(2)}</Text>
      </View>
      <View style={styles.itemAction}>
        {quantityInCart > 0 ? (
          <View style={styles.quantityControlContainer}>
            <TouchableOpacity onPress={() => handleQuantityChange(-1)} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantityInCart}</Text>
            <TouchableOpacity onPress={() => handleQuantityChange(1)} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleAddToCart} style={styles.addButton}>
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function ProductListScreen() {
  // Get subcategoryId from the dynamic route and title from the query params
  const { subcategoryId, title } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async () => {
    if (!subcategoryId) return; // Don't fetch if the ID isn't available yet

    setLoading(true);
    setError(null);
    try {
      // Fetch items filtered by the subcategory ID using your new API endpoint
      const response = await fetch(`http://10.0.2.2:5000/api/items?subcategory=${subcategoryId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (e) {
      console.error("Failed to fetch items:", e);
      setError(`Failed to load items: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [subcategoryId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  // Use the title passed in the URL for the screen header
  const screenTitle = title ? decodeURIComponent(title) : 'Products';

  if (loading) {
    return (
        <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text>Loading Items...</Text>
        </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContent}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity onPress={fetchItems} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* This sets the title of the screen in the header */}
      <Stack.Screen options={{ title: screenTitle }} />

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListEmptyComponent={
          <View style={styles.centerContent}>
              <Text>No items found in this category.</Text>
          </View>
        }
      />
    </View>
  );
}

// Using the more detailed styles from your original file
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 10, marginVertical: 5, borderRadius: 8, elevation: 1 },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#222' },
  itemPrice: { fontSize: 14, color: '#666', marginTop: 4 },
  itemAction: { minWidth: 90, alignItems: 'flex-end' },
  addButton: { borderWidth: 1, borderColor: '#1E88E5', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  addButtonText: { color: '#1E88E5', fontWeight: 'bold', fontSize: 14 },
  quantityControlContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E88E5', borderRadius: 8, width: 90 },
  quantityButton: { width: 30, height: 34, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantityValue: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  retryButton: { backgroundColor: '#1E88E5', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
