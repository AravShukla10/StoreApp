import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';

const currentOrders = [
  {
    id: 'ORD001',
    items: ['Milk', 'Bread'],
    total: 85,
    status: 'Packing',
  },
  {
    id: 'ORD002',
    items: ['Soap', 'Shampoo'],
    total: 120,
    status: 'Ready to Collect',
  },
];

const previousOrders = [
  {
    id: 'ORD000',
    items: ['Sugar', 'Snacks'],
    total: 95,
    status: 'Delivered',
  },
  {
    id: 'ORD099',
    items: ['Toothpaste', 'Oil'],
    total: 210,
    status: 'Delivered',
  },
];

export default function Orders() {
  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>Order #{item.id}</Text>
      <Text style={styles.itemList}>Items: {item.items.join(', ')}</Text>
      <Text style={styles.total}>Total: ₹{item.total}</Text>
      <Text
        style={[
          styles.status,
          item.status === 'Delivered'
            ? styles.delivered
            : styles.inProgress,
        ]}
      >
        {item.status}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Current Orders</Text>
      <FlatList
        data={currentOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      <Text style={styles.heading}>Previous Orders</Text>
      <FlatList
        data={previousOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#222',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  itemList: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  total: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
  },
  delivered: {
    color: '#28a745',
  },
  inProgress: {
    color: '#ff9900',
  },
});
