import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const API_BASE_URL_SHOPS = 'https://storeapp-uqap.onrender.com/api/shops';
const API_BASE_URL_ITEMS = 'https://storeapp-uqap.onrender.com/api/items';

export default function StockManagementScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingItemId, setUpdatingItemId] = useState(null); // To show a spinner on the specific item being updated
    const router = useRouter();

    const fetchStock = useCallback(async () => {
        // Only set main loading on initial fetch, not on refresh
        if (!refreshing) {
            setLoading(true);
        }
        setError(null);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                router.replace('/login');
                throw new Error("Authentication token not found.");
            }
            
            const ownerData = JSON.parse(atob(token.split('.')[1]));
            const shopId = ownerData.shopId;
            
            const response = await fetch(`${API_BASE_URL_SHOPS}/${shopId}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to fetch stock.');
            
            setItems(data.items || []);

        } catch (e) {
            setError(e.message);
        } finally {
            if (!refreshing) {
                setLoading(false);
            }
        }
    }, [router, refreshing]);

    useFocusEffect(useCallback(() => { fetchStock(); }, [fetchStock]));

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStock().then(() => setRefreshing(false));
    }, [fetchStock]);

    // --- ADDED: Function to handle incremental stock changes ---
    const handleQuantityChange = async (itemId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 0) {
            // Silently prevent stock from going below zero
            return;
        }

        setUpdatingItemId(itemId);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL_ITEMS}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                // Use the existing endpoint to update just the quantity
                body: JSON.stringify({ quantity_avl: newQuantity }),
            });

            const updatedItem = await response.json();
            if (response.ok) {
                // For instant UI feedback, update the state locally
                setItems(currentItems =>
                    currentItems.map(item =>
                        item._id === itemId ? { ...item, quantity_avl: newQuantity } : item
                    )
                );
            } else {
                throw new Error(updatedItem.message || "Failed to update quantity.");
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleDeleteItem = async (itemId) => {
        Alert.alert("Confirm Deletion", "Are you sure you want to delete this item?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('token');
                        const response = await fetch(`${API_BASE_URL_ITEMS}/${itemId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` },
                        });

                        if (response.ok) {
                            Alert.alert('Success', 'Item deleted successfully.');
                            onRefresh();
                        } else {
                            const data = await response.json();
                            Alert.alert('Error', data.message || 'Failed to delete item.');
                        }
                    } catch (error) {
                        Alert.alert('Error', 'An error occurred while deleting the item.');
                    }
                },
            },
        ]);
    };

    // --- UPDATED: renderItem now includes a quantity counter ---
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=No+Image' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price_per_quantity.toFixed(2)}</Text>
                <View style={styles.quantityContainer}>
                    <Text style={styles.itemQuantityLabel}>Stock:</Text>
                    {updatingItemId === item._id ? (
                        <ActivityIndicator style={{ marginHorizontal: 25 }} color="#1E88E5" />
                    ) : (
                        <View style={styles.counter}>
                            <TouchableOpacity onPress={() => handleQuantityChange(item._id, item.quantity_avl, -1)} style={styles.counterButton}>
                                <Ionicons name="remove-circle-outline" size={28} color="#dc3545" />
                            </TouchableOpacity>
                            <Text style={styles.counterValue}>{item.quantity_avl}</Text>
                            <TouchableOpacity onPress={() => handleQuantityChange(item._id, item.quantity_avl, 1)} style={styles.counterButton}>
                                <Ionicons name="add-circle-outline" size={28} color="#28a745" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/(owner)/edit-item?itemId=${item._id}`)}>
                    <Ionicons name="pencil-outline" size={22} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteItem(item._id)}>
                    <Ionicons name="trash-outline" size={22} color="#dc3545" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#1E88E5" />
                <Text>Loading Stock...</Text>
            </View>
        );
    }
    
    if (error) {
        return (
            <View style={styles.centerContent}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}><Text style={styles.retryButtonText}>Try Again</Text></TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {items.length === 0 ? (
                 <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Your inventory is empty.</Text>
                    <TouchableOpacity onPress={() => router.push('/(owner)/add-item')} style={styles.addButton}>
                        <Text style={styles.addButtonText}>Add Your First Item</Text>
                    </TouchableOpacity>
                 </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E88E5"]} />}
                />
            )}
        </View>
    );
}

// --- UPDATED: Styles added for the new quantity counter ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    listContainer: { padding: 15 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    emptyText: { fontSize: 16, color: '#6c757d', marginBottom: 20 },
    retryButton: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    addButton: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    itemContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    itemImage: { width: 70, height: 70, borderRadius: 10, marginRight: 15 },
    itemInfo: { flex: 1, justifyContent: 'center' },
    itemName: { fontSize: 18, fontWeight: 'bold', color: '#343a40' },
    itemPrice: { fontSize: 16, color: '#007bff', marginVertical: 2 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    itemQuantityLabel: { fontSize: 16, color: '#6c757d', marginRight: 8 },
    counter: { flexDirection: 'row', alignItems: 'center' },
    counterButton: { padding: 4 },
    counterValue: { fontSize: 18, fontWeight: 'bold', minWidth: 40, textAlign: 'center', color: '#343a40' },
    itemActions: { flexDirection: 'row', alignItems: 'center' },
    actionButton: { padding: 8, marginLeft: 8 },
});