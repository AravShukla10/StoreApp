import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext'; // Adjust path if needed

const BASE_URL = 'https://storeapp-rv3e.onrender.com';

// This component renders a single item card with cart controls
const ItemCard = ({ item, onUpdateCart }) => {
  const { cart } = useCart();
  const itemInCart = cart[item.name] > 0;

  return (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/100x100/e2e8f0/e2e8f0' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price_per_quantity || 0}</Text>
      </View>
      <View style={styles.itemControls}>
        {itemInCart ? (
          <View style={styles.counterContainer}>
            <TouchableOpacity onPress={() => onUpdateCart(item, -1)} style={styles.counterBtn}>
              <Text style={styles.counterText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{cart[item.name]}</Text>
            <TouchableOpacity onPress={() => onUpdateCart(item, 1)} style={styles.counterBtn}>
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => onUpdateCart(item, 1)} style={styles.addToCartBtn}>
            <Text style={styles.addToCartText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function ProductListScreen() {
  const { subcategoryId, title } = useLocalSearchParams();
  const { updateCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!subcategoryId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/items?subcategory=${subcategoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch items.');
      }
      const data = await response.json();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [subcategoryId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  const syncCartWithBackend = async (item, change) => {
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');
    if (!userId || !token) {
      Alert.alert("Authentication Required", "Please log in to update your cart.");
      return;
    }
    try {
      await fetch(`${BASE_URL}/api/users/${userId}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item._id, quantity: change }),
      });
    } catch (apiError) {
      Alert.alert("Error", `Failed to update cart on server: ${apiError.message}`);
    }
  };

  const handleUpdateCart = (item, change) => {
    updateCart(item.name, change);
    syncCartWithBackend(item, change);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />;
  }

  if (error) {
    return (
      <View style={styles.centerContent}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={fetchItems} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: title || 'Products' }} />
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ItemCard item={item} onUpdateCart={handleUpdateCart} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No items found in this category.</Text>}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 14, color: '#666', marginTop: 4 },
  itemControls: { justifyContent: 'center', alignItems: 'center' },
  counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8 },
  counterBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  counterText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  counterValue: { fontSize: 16, fontWeight: '600', width: 30, textAlign: 'center' },
  addToCartBtn: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 8 },
  addToCartText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  retryButton: { backgroundColor: '#000', padding: 12, borderRadius: 8, marginTop: 10 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
});