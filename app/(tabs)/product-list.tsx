// app/(tabs)/product-list.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // Use useRouter
import { useCart } from '../../context/CartContext'; // Path relative to app/(tabs)/

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

const DUMMY_PRODUCTS: Product[] = [
  { id: '1', name: 'Apples', price: 2.50, image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Apple', description: 'Fresh, crispy red apples.' },
  { id: '2', name: 'Milk (1L)', price: 3.00, image: 'https://via.placeholder.com/150/ADD8E6/FFFFFF?text=Milk', description: 'Fresh, pasteurized full-fat milk.' },
  { id: '3', name: 'Bread', price: 2.00, image: 'https://via.placeholder.com/150/DAA520/FFFFFF?text=Bread', description: 'Whole wheat artisan bread.' },
  { id: '4', name: 'Eggs (dozen)', price: 4.25, image: 'https://via.placeholder.com/150/F8DE7E/FFFFFF?text=Eggs', description: 'Farm fresh brown eggs.' },
  { id: '5', name: 'Cheese', price: 7.75, image: 'https://via.placeholder.com/150/FFD700/FFFFFF?text=Cheese', description: 'Aged cheddar cheese block.' },
];

export default function ProductListScreen() {
  const router = useRouter(); // Initialize router
  const { addToCart } = useCart();

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => router.push({ pathname: '/product-detail', params: { product: JSON.stringify(item) } })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Our Products</Text>
      <FlatList
        data={DUMMY_PRODUCTS}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 10,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});