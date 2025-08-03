import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    FlatList, // Using FlatList for the grid is a more robust approach
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// This component renders a single subcategory card in the grid.
const SubcategoryCard = ({ subcategory, onPress }) => (
  <TouchableOpacity style={styles.categoryCardContainer} onPress={onPress}>
    <View style={styles.categoryCard}>
      <Image
        source={{ uri: subcategory.imageUrl || 'https://placehold.co/150x150/e2e8f0/e2e8f0' }}
        style={styles.categoryImage}
      />
      <Text style={styles.categoryName} numberOfLines={2}>
        {subcategory.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function Categories() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://storeapp-rv3e.onrender.com/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // CORRECTED: Transform the API data into a more robust format for SectionList.
      // Each section's data contains a single item: an object with a unique ID and the subcategory list.
      // This prevents key conflicts and is a cleaner pattern.
      const formattedData = data
        .filter(category => category.subcategories.length > 0) // Only show categories with subcategories
        .map(category => ({
          title: category.name,
          // The data for the section is an array with a single object.
          // This object contains the subcategories needed to render the grid.
          data: [{
            id: category._id, // Unique ID for the keyExtractor
            subcategories: category.subcategories
          }], 
      }));
      
      setSections(formattedData);
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      setError(`Failed to load categories: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // This function handles navigation to the product list screen.
  const handleSubcategoryPress = (subcategory) => {
    // Navigate to a dynamic route, passing the subcategory's ID and name.
    router.push(`/products/${subcategory._id}?title=${encodeURIComponent(subcategory.name)}`);
  };

  // CORRECTED: The render function now correctly accesses the nested subcategories array.
  const renderSectionGrid = ({ item }) => {
    // item is now an object: { id: '...', subcategories: [...] }
    return (
      <View style={styles.sectionGrid}>
        {item.subcategories.map(subcategory => (
          <SubcategoryCard
            key={subcategory._id}
            subcategory={subcategory}
            onPress={() => handleSubcategoryPress(subcategory)}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#222" />
        <Text>Loading Categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContent}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity onPress={fetchCategories} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      // CORRECTED: The key extractor now uses the unique ID from our new data structure.
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeaderText}>{title}</Text>
      )}
      // Use the corrected render function
      renderItem={renderSectionGrid}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 20, marginBottom: 10, marginLeft: 16 },
  sectionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', paddingHorizontal: 8 },
  categoryCardContainer: { width: '25%', padding: 8 },
  categoryCard: { alignItems: 'center' },
  categoryImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0' },
  categoryName: { marginTop: 8, fontSize: 13, fontWeight: '500', color: '#333', textAlign: 'center', height: 34 },
  retryButton: { backgroundColor: '#000000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});