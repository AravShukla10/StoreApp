import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Make sure to install expo-linear-gradient

// --- MOCK DATA (Replace with API calls) ---
// In a real app, you would fetch this data from your backend.
const mockStats = {
  totalRevenue: 5230.50,
  totalOrders: 124,
  newCustomers: 15,
  pendingOrders: 5,
};

const mockTopProducts = [
  { id: '1', name: 'Organic Bananas', sales: 350.00, unitsSold: 150 },
  { id: '2', name: 'Whole Milk', sales: 275.50, unitsSold: 100 },
  { id: '3', name: 'Artisan Bread', sales: 210.00, unitsSold: 70 },
];

const mockRecentOrders = [
    { id: 'order1', customerName: 'Alice Johnson', total: 45.50, items: 3, status: 'Completed' },
    { id: 'order2', customerName: 'Bob Williams', total: 22.00, items: 2, status: 'Pending' },
    { id: 'order3', customerName: 'Charlie Brown', total: 89.99, items: 5, status: 'Completed' },
    { id: 'order4', customerName: 'Diana Prince', total: 12.75, items: 1, status: 'Shipped' },
];


const BASE_URL = 'https://storeapp-rv3e.onrender.com';

// --- AdminDashboard Component ---
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real application, you would fetch the admin token.
      // const token = await AsyncStorage.getItem('adminToken');
      // if (!token) {
      //   throw new Error("Authentication required. Please log in as an admin.");
      // }
      // const headers = { 'Authorization': `Bearer ${token}` };

      // --- Replace mock data with actual API calls ---
      // const statsResponse = await fetch(`${BASE_URL}/api/admin/stats`, { headers });
      // const topProductsResponse = await fetch(`${BASE_URL}/api/admin/top-products`, { headers });
      // const recentOrdersResponse = await fetch(`${BASE_URL}/api/admin/recent-orders`, { headers });

      // if (!statsResponse.ok || !topProductsResponse.ok || !recentOrdersResponse.ok) {
      //   throw new Error('Failed to fetch dashboard data.');
      // }

      // const statsData = await statsResponse.json();
      // const topProductsData = await topProductsResponse.json();
      // const recentOrdersData = await recentOrdersResponse.json();

      // Using mock data for demonstration purposes
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setStats(mockStats);
      setTopProducts(mockTopProducts);
      setRecentOrders(mockRecentOrders);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
       <Image source={icon} style={styles.statIcon} />
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
        <Text style={styles.productName}>{item.name}</Text>
        <View>
            <Text style={styles.productSales}>Sales: ₹{item.sales.toFixed(2)}</Text>
            <Text style={styles.productUnits}>Units: {item.unitsSold}</Text>
        </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
        <View style={styles.orderInfo}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.orderItems}>{item.items} items</Text>
        </View>
        <View style={styles.orderStatusContainer}>
            <Text style={styles.orderTotal}>₹{item.total.toFixed(2)}</Text>
            <Text style={[styles.orderStatus, {
                backgroundColor: item.status === 'Completed' ? '#28a745' : item.status === 'Pending' ? '#ffc107' : '#17a2b8'
            }]}>{item.status}</Text>
        </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#007bff', '#28a745']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Store Performance Overview</Text>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} />
        <StatCard title="Total Orders" value={stats.totalOrders}  />
        <StatCard title="New Customers" value={stats.newCustomers}  />
        <StatCard title="Pending Orders" value={stats.pendingOrders}  />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <FlatList
          data={topProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
         <FlatList
          data={recentOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#007bff'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: -20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
      width: 40,
      height: 40,
      marginBottom: 10,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#444',
  },
  productSales: {
      fontSize: 15,
      color: '#28a745',
      fontWeight: 'bold',
      textAlign: 'right',
  },
   productUnits: {
      fontSize: 13,
      color: '#777',
      textAlign: 'right',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
      flex: 1,
  },
  customerName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
  },
  orderItems: {
      fontSize: 14,
      color: '#777',
      marginTop: 2,
  },
  orderStatusContainer: {
      alignItems: 'flex-end',
  },
  orderTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
  },
  orderStatus: {
      fontSize: 12,
      color: '#fff',
      fontWeight: 'bold',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      overflow: 'hidden', // for borderRadius to work on Text
  },
});
