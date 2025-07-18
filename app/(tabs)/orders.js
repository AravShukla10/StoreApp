import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useOrders } from '../context/OrderContext';
import { useFocusEffect } from '@react-navigation/native';

export default function Orders() {
  const { orders, loading, error, fetchOrders } = useOrders();

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const currentOrders = sortedOrders.filter((o) => !o.isCompleted);
  const previousOrders = sortedOrders.filter((o) => o.isCompleted);

  const renderOrder = ({ item: order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
        <Text style={styles.orderTotal}>Total: ₹{(order.totalAmount || 0).toFixed(2)}</Text>
      </View>
      
      <Text style={styles.itemsTitle}>Items:</Text>
      {order.items.map(product => (
        <Text key={product.itemId._id} style={styles.itemList}>
          - {product.itemId.name} × {product.quantity}
        </Text>
      ))}

      <Text style={styles.status}>Status: {order.status}</Text>
      <Text style={styles.time}>
        Placed on: {new Date(order.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading your orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Current Orders</Text>
      {currentOrders.length === 0 ? (
        <Text style={styles.emptyText}>No current orders.</Text>
      ) : (
        <FlatList
          data={currentOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id.toString()}
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
          keyExtractor={(item) => item._id.toString()}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', marginVertical: 12, color: '#343a40' },
  orderCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  orderId: { fontSize: 16, fontWeight: '600', color: '#007bff' },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: '#28a745' },
  itemsTitle: { fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 5 },
  itemList: { fontSize: 14, color: '#6c757d', marginLeft: 10, lineHeight: 20 },
  status: { fontSize: 14, fontWeight: '600', color: '#ff9900', marginTop: 10, textTransform: 'capitalize' },
  time: { fontSize: 12, color: '#6c757d', marginTop: 5 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', paddingVertical: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 10 },
  retryButton: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  retryButtonText: { color: '#fff', fontSize: 16 }
});