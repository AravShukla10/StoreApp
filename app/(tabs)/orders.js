import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { useOrders } from '../context/OrderContext';

export default function Orders() {
  const { orders } = useOrders();

  const sortedOrders = [...orders].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

  const currentOrders = sortedOrders.filter((o) => o.status !== 'Delivered');
  const previousOrders = sortedOrders.filter((o) => o.status === 'Delivered');

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>Order #{item.id}</Text>
      <Text style={styles.itemList}>
        Items: {Object.entries(item.items).map(([name, qty]) => `${name} × ${qty}`).join(', ')}
      </Text>
      <Text style={styles.total}>Status: {item.status}</Text>
      <Text style={styles.time}>
        Placed on: {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Current Orders</Text>
      {currentOrders.length === 0 ? (
        <Text style={styles.emptyText}>No current orders.</Text>
      ) : (
        <FlatList
          data={currentOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}

      <Text style={styles.heading}>Previous Orders</Text>
      {previousOrders.length === 0 ? (
        <Text style={styles.emptyText}>No previous orders.</Text>
      ) : (
        <FlatList
          data={previousOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}
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
    fontWeight: '600',
    color: '#ff9900',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
});
