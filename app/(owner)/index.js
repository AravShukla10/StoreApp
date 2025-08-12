import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const API_BASE_URL_OWNERS = 'http://10.0.2.2:5000/api/owners';
const API_BASE_URL_BOOKINGS = 'http://10.0.2.2:5000/api/bookings';

// --- Reusable Components ---
const KpiCard = ({ icon, title, value, color }) => (
    <View style={styles.kpiCard}>
        <Ionicons name={icon} size={28} color={color} style={styles.kpiIcon} />
        <View>
            <Text style={styles.kpiValue}>{value}</Text>
            <Text style={styles.kpiTitle}>{title}</Text>
        </View>
    </View>
);

const OrderSkeletonCard = () => (
    <View style={[styles.orderItem, styles.skeletonCard]}>
        <View style={styles.skeletonHeader}>
            <View style={styles.skeletonTextLarge} />
            <View style={styles.skeletonBadge} />
        </View>
        <View style={styles.skeletonTextMedium} />
        <View style={styles.skeletonTextSmall} />
    </View>
);

const EmptyState = ({ filter }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="file-tray-outline" size={72} color="#dee2e6" />
        <Text style={styles.emptyText}>No {filter} orders found</Text>
        <Text style={styles.emptySubText}>New orders will appear here when they are placed.</Text>
    </View>
);


export default function OwnerDashboard() {
    const [allOrders, setAllOrders] = useState([]);
    const [shopName, setShopName] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('active');
    const router = useRouter();

    const fetchData = useCallback(async (isBackgroundRefresh = false) => {
        if (!refreshing && !isBackgroundRefresh && allOrders.length === 0) {
            setLoading(true);
        }
        setError(null);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                router.replace('/login');
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };
            const ownerData = JSON.parse(atob(token.split('.')[1]));
            setShopName(ownerData.name ? `${ownerData.name}'s Shop` : 'Owner Dashboard');

            const ordersResponse = await fetch(`${API_BASE_URL_OWNERS}/my-shop/orders`, { headers });
            const ordersData = await ordersResponse.json();
            if (!ordersResponse.ok) throw new Error(ordersData.message || 'Failed to fetch orders.');
            setAllOrders(ordersData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [router, refreshing, allOrders.length]);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
    const onRefresh = useCallback(() => { setRefreshing(true); fetchData().then(() => setRefreshing(false)); }, [fetchData]);

    useEffect(() => {
        const sub1 = Notifications.addNotificationReceivedListener(n => {
          if (n.request.content.title.includes('New Order #')) {
            fetchData(true);
          }
        });
        const sub2 = Notifications.addNotificationResponseReceivedListener(r => console.log('Notification Response:', r));
        return () => {
          sub1.remove();
          sub2.remove();
        };
    }, [fetchData]);

    const { kpis, filteredOrders } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysCompletedOrders = allOrders.filter(order => order.status === 'completed' && new Date(order.updatedAt) >= today);
        const revenue = todaysCompletedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingCount = allOrders.filter(order => order.status === 'pending').length;
        const confirmedCount = allOrders.filter(order => order.status === 'confirmed').length;

        const sorted = [...allOrders].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        const activeOrders = sorted.filter(order => order.status === 'pending' || order.status === 'confirmed');

        return {
            kpis: { revenue: `₹${revenue.toFixed(2)}`, pending: pendingCount, confirmed: confirmedCount },
            filteredOrders: filter === 'active' ? activeOrders : sorted,
        };
    }, [allOrders, filter]);

    const handleUpdateOrderStatus = async (orderId, status) => {
        setUpdatingOrderId(orderId);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL_BOOKINGS}/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', `Order has been ${status}.`);
                onRefresh();
            } else {
                throw new Error(data.message || 'Failed to update order status.');
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={[
            styles.orderItem,
            item.status === 'pending' && styles.pendingOrderItem,
            (item.status === 'completed' || item.status === 'cancelled') && styles.inactiveOrderItem,
        ]}>
            <View style={styles.orderHeader}>
                <View style={styles.orderHeaderText}>
                    <Text style={styles.customerName}>{item.userId?.name || 'Unknown User'}</Text>
                    {item.dailyOrderNumber && <Text style={styles.orderNumber}>Order #{item.dailyOrderNumber}</Text>}
                </View>
                <Text style={styles.timestamp}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Text>
            </View>
            <Text style={styles.orderItems} numberOfLines={2}>
                Items: {item.items.map(i => i.itemId?.name || 'Item').join(', ')}
            </Text>
            <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>Total: ₹{item.totalAmount.toFixed(2)}</Text>
                <Text style={[styles.orderStatus, {
                    backgroundColor: item.status === 'completed' ? '#28a745' : item.status === 'pending' ? '#ffc107' : item.status === 'confirmed' ? '#17a2b8' : '#dc3545'
                }]}>{item.status}</Text>
            </View>
            {(item.status === 'pending' || item.status === 'confirmed') && (
                <View style={styles.actionContainer}>
                    {updatingOrderId === item._id ? <ActivityIndicator color="#1E88E5" /> : (
                        <>
                            {item.status === 'pending' && <>
                                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleUpdateOrderStatus(item._id, 'cancelled')}>
                                    <Ionicons name="close-outline" size={20} color="#fff" /><Text style={styles.actionButtonText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleUpdateOrderStatus(item._id, 'confirmed')}>
                                    <Ionicons name="checkmark-outline" size={20} color="#fff" /><Text style={styles.actionButtonText}>Accept</Text>
                                </TouchableOpacity>
                            </>}
                            {item.status === 'confirmed' &&
                                <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={() => handleUpdateOrderStatus(item._id, 'completed')}>
                                    <Ionicons name="bag-check-outline" size={20} color="#fff" /><Text style={styles.actionButtonText}>Complete</Text>
                                </TouchableOpacity>
                            }
                        </>
                    )}
                </View>
            )}
        </View>
    );

    const renderDashboardContent = () => (
        <>
            <View style={styles.kpiContainer}>
                <KpiCard icon="cash-outline" title="Today's Revenue" value={kpis.revenue} color="#28a745" />
                <KpiCard icon="hourglass-outline" title="Pending Orders" value={kpis.pending} color="#ffc107" />
                <KpiCard icon="checkmark-done-outline" title="Confirmed Orders" value={kpis.confirmed} color="#17a2b8" />
            </View>
            <View style={styles.content}>
                <View style={styles.filterContainer}>
                    <TouchableOpacity style={[styles.filterButton, filter === 'active' && styles.filterActive]} onPress={() => setFilter('active')}>
                        <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>Active Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterButton, filter === 'all' && styles.filterActive]} onPress={() => setFilter('all')}>
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All Orders</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id}
                    scrollEnabled={false}
                    ListEmptyComponent={<EmptyState filter={filter} />}
                />
            </View>
        </>
    );

    if (loading) {
        return (
            <ScrollView style={styles.container}>
                <LinearGradient colors={['#1E88E5', '#4FC3F7']} style={styles.header} />
                <View style={{ marginTop: -60, paddingHorizontal: 15 }}><View style={styles.kpiContainer}><KpiCard /><KpiCard /><KpiCard /></View></View>
                <View style={styles.content}>
                    <OrderSkeletonCard />
                    <OrderSkeletonCard />
                    <OrderSkeletonCard />
                </View>
            </ScrollView>
        );
    }
    
    if (error) {
        return (
            <View style={styles.centerContent}>
                <Ionicons name="cloud-offline-outline" size={64} color="#dc3545" />
                <Text style={styles.errorText}>Failed to load data</Text>
                <Text style={styles.errorSubText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <LinearGradient colors={['#1E88E5', '#4FC3F7']} style={styles.header}>
                <Text style={styles.headerTitle}>{shopName}</Text>
            </LinearGradient>
            {renderDashboardContent()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f8fa' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 80, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    kpiContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -60, paddingHorizontal: 10 },
    kpiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, padding: 15, flex: 1, marginHorizontal: 5, elevation: 8, shadowColor: '#003d7a', shadowOpacity: 0.1, shadowRadius: 10 },
    kpiIcon: { marginRight: 12 },
    kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    kpiTitle: { fontSize: 13, color: '#666' },
    content: { padding: 15 },
    filterContainer: { flexDirection: 'row', backgroundColor: '#e9ecef', borderRadius: 25, padding: 5, marginBottom: 20 },
    filterButton: { flex: 1, paddingVertical: 10, borderRadius: 20 },
    filterActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1 },
    filterText: { textAlign: 'center', fontWeight: '600', color: '#6c757d' },
    filterTextActive: { color: '#1E88E5' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#495057', marginTop: 16 },
    emptySubText: { fontSize: 14, color: '#6c757d', marginTop: 8, textAlign: 'center' },
    errorText: { fontSize: 18, fontWeight: 'bold', color: '#dc3545', marginTop: 16 },
    errorSubText: { fontSize: 14, color: '#6c757d', marginTop: 4, marginBottom: 20 },
    retryButton: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    orderItem: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#3c4043', shadowOpacity: 0.08, shadowRadius: 6, borderWidth: 1, borderColor: 'transparent' },
    pendingOrderItem: { borderColor: '#ffc107', borderWidth: 2 },
    inactiveOrderItem: { opacity: 0.7, backgroundColor: '#f8f9fa' },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    orderHeaderText: { flex: 1, marginRight: 8 },
    customerName: { fontSize: 17, fontWeight: 'bold', color: '#343a40' },
    orderNumber: { fontSize: 14, color: '#6c757d', fontWeight: '500', marginTop: 2 },
    timestamp: { fontSize: 13, color: '#adb5bd', fontStyle: 'italic' },
    orderItems: { fontSize: 14, color: '#495057', marginBottom: 12 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderTotal: { fontSize: 16, fontWeight: 'bold', color: '#343a40' },
    orderStatus: { fontSize: 12, color: '#fff', fontWeight: 'bold', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, overflow: 'hidden' },
    actionContainer: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 10, marginTop: 10 },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginLeft: 10 },
    acceptButton: { backgroundColor: '#28a745' },
    rejectButton: { backgroundColor: '#dc3545' },
    completeButton: { backgroundColor: '#17a2b8' },
    actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginLeft: 5 },
    skeletonCard: { backgroundColor: '#fff' },
    skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    skeletonTextLarge: { width: '50%', height: 20, backgroundColor: '#e9ecef', borderRadius: 4 },
    skeletonBadge: { width: 80, height: 24, backgroundColor: '#e9ecef', borderRadius: 12 },
    skeletonTextMedium: { width: '80%', height: 16, backgroundColor: '#e9ecef', borderRadius: 4, marginBottom: 10 },
    skeletonTextSmall: { width: '30%', height: 16, backgroundColor: '#e9ecef', borderRadius: 4 },
});