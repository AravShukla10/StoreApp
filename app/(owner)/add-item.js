import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const API_BASE_URL_OWNERS = 'https://storeapp-uqap.onrender.com/api/owners';
const API_BASE_URL_CATEGORIES = 'https://storeapp-uqap.onrender.com/api/categories';

export default function AddItemScreen() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    
    // State to handle different image sources
    const [image, setImage] = useState(null); // For local images (camera/library)
    const [imageUrl, setImageUrl] = useState(''); // For remote image links
    const [imageSourceType, setImageSourceType] = useState(null); // 'library', 'camera', or 'link'

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(API_BASE_URL_CATEGORIES);
                const data = await response.json();
                if (response.ok) setCategories(data);
                else Alert.alert('Error', 'Failed to fetch categories.');
            } catch (error) {
                Alert.alert('Error', 'An error occurred while fetching categories.');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const category = categories.find(c => c._id === selectedCategory);
            setSubcategories(category ? category.subcategories : []);
            setSelectedSubcategory(null);
        } else {
            setSubcategories([]);
        }
    }, [selectedCategory, categories]);

    const showImageOptions = () => {
        Alert.alert(
            "Select Image Source",
            "Choose how you want to add an image for the item.",
            [
                { text: "Take Photo...", onPress: () => captureImage() },
                { text: "Choose from Library...", onPress: () => pickImageFromLibrary() },
                { text: "Use Image Link...", onPress: () => setImageSourceType('link') },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const captureImage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            setImageUrl(''); // Clear any existing URL
            setImageSourceType('camera');
        }
    };

    const pickImageFromLibrary = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            setImageUrl(''); // Clear any existing URL
            setImageSourceType('library');
        }
    };

    const handleAddItem = async () => {
        if (!name || !price || !quantity || !selectedCategory || !selectedSubcategory || (!image && !imageUrl)) {
            Alert.alert('Missing Information', 'Please fill all fields and provide an image.');
            return;
        }
        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Authentication Error', 'You are not logged in.');
                router.replace('/login');
                return;
            }

            const bodyPayload = {
                name,
                price_per_quantity: parseFloat(price),
                quantity_avl: parseInt(quantity, 10),
                category: selectedCategory,
                subcategory: selectedSubcategory,
            };

            // Conditionally add image data based on source
            if (image) {
                bodyPayload.imageFile = `data:image/jpeg;base64,${image.base64}`;
            } else if (imageUrl) {
                bodyPayload.imageUrl = imageUrl;
            }

            const response = await fetch(`${API_BASE_URL_OWNERS}/my-shop/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bodyPayload),
            });

            const responseData = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Item added successfully!');
                router.push('/(owner)');
            } else {
                Alert.alert('Error', responseData.message || 'Failed to add item.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Text style={styles.title}>Add New Item</Text>

            <TextInput style={styles.input} placeholder="Item Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Price per Unit (e.g., 50.00)" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Available Quantity (e.g., 100)" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

            <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedCategory} onValueChange={(itemValue) => setSelectedCategory(itemValue)}>
                    <Picker.Item label="Select Category..." value={null} />
                    {categories.map(cat => <Picker.Item key={cat._id} label={cat.name} value={cat._id} />)}
                </Picker>
            </View>

            {selectedCategory && (
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={selectedSubcategory} onValueChange={(itemValue) => setSelectedSubcategory(itemValue)}>
                        <Picker.Item label="Select Subcategory..." value={null} />
                        {subcategories.map(sub => <Picker.Item key={sub._id} label={sub.name} value={sub._id} />)}
                    </Picker>
                </View>
            )}

            <TouchableOpacity style={styles.imagePicker} onPress={showImageOptions}>
                <Ionicons name="image-outline" size={24} color="#495057" />
                <Text style={styles.imagePickerText}>Add Item Image</Text>
            </TouchableOpacity>

            {imageSourceType === 'link' && (
                <TextInput
                    style={styles.input}
                    placeholder="Paste Image URL here"
                    value={imageUrl}
                    onChangeText={(text) => {
                        setImageUrl(text);
                        setImage(null); // Clear local image if user types a URL
                    }}
                />
            )}

            {image && <Image source={{ uri: image.uri }} style={styles.previewImage} />}
            {imageUrl && !image && <Image source={{ uri: imageUrl }} style={styles.previewImage} />}


            <TouchableOpacity style={styles.button} onPress={handleAddItem} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Item to Shop</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
    pickerContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 15 },
    imagePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9ecef', padding: 15, borderRadius: 10, marginBottom: 15, gap: 10 },
    imagePickerText: { color: '#495057', fontWeight: 'bold', fontSize: 16 },
    previewImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20, alignSelf: 'center', backgroundColor: '#e9ecef' },
    button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
