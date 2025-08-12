import { useFocusEffect } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrderContext';

// --- Reusable Components ---

const OrderSkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader}>
      <View style={styles.skeletonTextLarge} />
      <View style={styles.skeletonTextMedium} />
    </View>
    <View style={styles.skeletonTextSmall} />
    <View style={styles.skeletonTextSmall} />
  </View>
);

const EmptyState = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="receipt-outline" size={64} color="#ced4da" />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const OrderCard = ({ order }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { backgroundColor: '#ffc107', color: '#fff' };
      case 'confirmed': return { backgroundColor: '#17a2b8', color: '#fff' };
      case 'completed': return { backgroundColor: '#28a745', color: '#fff' };
      case 'cancelled': return { backgroundColor: '#dc3545', color: '#fff' };
      default: return { backgroundColor: '#6c757d', color: '#fff' };
    }
  };
  const statusStyle = getStatusStyle(order.status);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{order.dailyOrderNumber}</Text>
          <Text style={styles.orderSubId}>(...{order._id.slice(-6)})</Text>
        </View>
        <Text style={styles.orderTotal}>₹{(order.totalAmount || 0).toFixed(2)}</Text>
      </View>
      
      <Text style={styles.shopName}>From: {order.shopId?.name || 'Unknown Shop'}</Text>

      <Text style={styles.itemsTitle}>Items:</Text>
      {order.items.map(product => (
        <Text key={product.itemId?._id || product._id} style={styles.itemList}>
          - {product.itemId?.name || 'Unknown Item'} × {product.quantity}
        </Text>
      ))}

      <View style={styles.orderFooter}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.status, { color: statusStyle.color }]}>{order.status}</Text>
        </View>
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
};

export default function Orders() {
  const { orders, loading, error, fetchOrders } = useOrders();

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, []) // Keep dependency array empty to avoid re-triggering based on fetchOrders identity
  );

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const currentOrders = sortedOrders.filter((o) => !o.isCompleted);
  const previousOrders = sortedOrders.filter((o) => o.isCompleted);

  if (loading && orders.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Current Orders</Text>
        <OrderSkeletonCard />
        <Text style={styles.heading}>Previous Orders</Text>
        <OrderSkeletonCard />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={64} color="#dc3545" />
        <Text style={styles.errorText}>Failed to load orders</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Current Orders</Text>
      <FlatList
        data={currentOrders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={(item) => item._id.toString()}
        scrollEnabled={false}
        ListEmptyComponent={<EmptyState message="You have no active orders." />}
      />

      <Text style={styles.heading}>Previous Orders</Text>
      <FlatList
        data={previousOrders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={(item) => item._id.toString()}
        scrollEnabled={false}
        ListEmptyComponent={<EmptyState message="No past orders found." />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', marginVertical: 12, color: '#343a40' },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#3c4043', shadowOpacity: 0.1, shadowRadius: 6 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  orderSubId: { fontSize: 12, color: '#adb5bd' },
  orderTotal: { fontSize: 18, fontWeight: 'bold', color: '#28a745' },
  shopName: { fontSize: 14, fontWeight: '500', color: '#495057', marginBottom: 12, fontStyle: 'italic' },
  itemsTitle: { fontSize: 15, fontWeight: '600', color: '#495057', marginBottom: 5 },
  itemList: { fontSize: 14, color: '#6c757d', marginLeft: 10, lineHeight: 22 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 10 },
  statusBadge: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 15 },
  status: { fontSize: 13, fontWeight: 'bold', textTransform: 'capitalize' },
  time: { fontSize: 13, color: '#6c757d' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#6c757d', marginTop: 16 },
  errorText: { fontSize: 18, fontWeight: 'bold', color: '#dc3545', marginTop: 16 },
  errorSubText: { fontSize: 14, color: '#6c757d', marginTop: 4, marginBottom: 20, textAlign: 'center' },
  retryButton: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  skeletonCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  skeletonTextLarge: { width: '40%', height: 24, backgroundColor: '#e9ecef', borderRadius: 4 },
  skeletonTextMedium: { width: '25%', height: 24, backgroundColor: '#e9ecef', borderRadius: 4 },
  skeletonTextSmall: { width: '70%', height: 16, backgroundColor: '#e9ecef', borderRadius: 4, marginBottom: 8 },
});