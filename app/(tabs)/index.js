import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image,
} from 'react-native';
import { useCart } from '../context/CartContext'; // adjust path if needed

const categories = [
  { name: 'Groceries', icon: require('../../assets/groceries.jpeg') },
  { name: 'Snacks', icon: require('../../assets/snacks.jpeg') },
  { name: 'Toiletries', icon: require('../../assets/toiletries.jpeg') },
  { name: 'Beverages', icon: require('../../assets/beverages.jpeg') },
];

const featuredItems = [
  { id: '1', name: 'Milk', price: 30, image: require('../../assets/milk.jpeg') },
  { id: '2', name: 'Bread', price: 25, image: require('../../assets/bread.jpeg') },
  { id: '3', name: 'Soap', price: 20, image: require('../../assets/soap.jpeg') },
];

export default function Home() {
  const { cart, updateCart } = useCart();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Welcome to Daily Need</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search items..."
        placeholderTextColor="#888"
      />
      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((cat, idx) => (
          <TouchableOpacity key={idx} style={styles.categoryCard}>
            <Image source={cat.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Featured Items */}
      <Text style={styles.sectionTitle}>Featured Items</Text>
      <View style={styles.featuredContainer}>
        {featuredItems.map((item) => (
          <View key={item.id} style={styles.featuredCard}>
            <Image source={item.image} style={styles.featuredImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>

            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => updateCart(item.name, -1)} style={styles.counterBtn}>
                <Text style={styles.counterText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{cart[item.name] || 0}</Text>
              <TouchableOpacity onPress={() => updateCart(item.name, 1)} style={styles.counterBtn}>
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f2f2f2', padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#222' },
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
});
