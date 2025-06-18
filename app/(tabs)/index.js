import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';

const categories = [
  { name: 'Groceries', icon: require('../../assets/groceries.jpeg') },
  { name: 'Snacks', icon: require('../../assets/snacks.jpeg') },
  { name: 'Toiletries', icon: require('../../assets/toiletries.jpeg') },
  { name: 'Beverages', icon: require('../../assets/beverages.jpeg') },
];

const featuredItems = [
  { name: 'Milk', price: '₹30', image: require('../../assets/milk.jpeg') },
  { name: 'Bread', price: '₹25', image: require('../../assets/bread.jpeg') },
  { name: 'Soap', price: '₹20', image: require('../../assets/soap.jpeg') },
];

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Welcome to Daily Need</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search items..."
        placeholderTextColor="#888"
      />

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((cat, idx) => (
          <TouchableOpacity key={idx} style={styles.categoryCard}>
            <Image source={cat.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Featured Items</Text>
      <View style={styles.featuredContainer}>
        {featuredItems.map((item, idx) => (
          <View key={idx} style={styles.featuredCard}>
            <Image source={item.image} style={styles.featuredImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  featuredContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featuredCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
