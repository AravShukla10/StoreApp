import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const API_BASE_URL_ITEMS = 'https://storeapp-uqap.onrender.com/api/items';

export default function EditItemScreen() {
    const { itemId } = useLocalSearchParams();
    const router = useRouter();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItemDetails = async () => {
            if (!itemId) return;
            setLoading(true);
            try {
                // Note: Fetching a single item might be a public or protected route.
                // Assuming it's public for simplicity.
                const response = await fetch(`${API_BASE_URL_ITEMS}/${itemId}`);
                const data = await response.json();
                if (response.ok) {
                    setName(data.name);
                    setPrice(data.price_per_quantity.toString());
                    setQuantity(data.quantity_avl.toString());
                } else {
                    throw new Error(data.message || 'Failed to fetch item details.');
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchItemDetails();
    }, [itemId]);

    const handleUpdateItem = async () => {
        if (!name || !price || !quantity) {
            Alert.alert('Missing Information', 'Please fill all fields.');
            return;
        }
        setUpdating(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const body = {
                name,
                price_per_quantity: parseFloat(price),
                quantity_avl: parseInt(quantity, 10),
            };

            const response = await fetch(`${API_BASE_URL_ITEMS}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const responseData = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Item updated successfully!');
                router.back(); // Go back to the stock list
            } else {
                throw new Error(responseData.message || 'Failed to update item.');
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setUpdating(false);
        }
    };
    
    if (loading) {
        return <View style={styles.centerContent}><ActivityIndicator size="large" /></View>;
    }

    if (error) {
        return <View style={styles.centerContent}><Text style={styles.errorText}>{error}</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Edit Item</Text>
            <TextInput style={styles.input} placeholder="Item Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Price per Unit" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Available Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

            <TouchableOpacity style={styles.button} onPress={handleUpdateItem} disabled={updating}>
                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Item</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
