import { useLocalSearchParams, useRouter } from 'expo-router'; // Import useLocalSearchParams
import { useCallback, useEffect, useRef, useState } from 'react'; // Import useRef
import {
    ActivityIndicator,
    Image,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SubcategoryCard = ({ subcategory, onPress }) => (
  <TouchableOpacity style={styles.categoryCardContainer} onPress={onPress}>
    <View style={styles.categoryCard}>
      <Image source={{ uri: subcategory.imageUrl || 'https://placehold.co/150x150/e2e8f0/e2e8f0' }} style={styles.categoryImage} />
      <Text style={styles.categoryName} numberOfLines={2}>{subcategory.name}</Text>
    </View>
  </TouchableOpacity>
);

export default function Categories() {
  const router = useRouter();
  const sectionListRef = useRef(null); // Create a ref for the SectionList
  const params = useLocalSearchParams(); // Get URL params
  const { title } = params; // Extract the title param

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://storeapp-rv3e.onrender.com/api/categories');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const formattedData = data
        .filter(category => category.subcategories.length > 0)
        .map(category => ({
          title: category.name,
          data: [{ id: category._id, subcategories: category.subcategories }], 
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

  // --- AUTO-SCROLL EFFECT ---
  // This effect runs when the component loads or when `sections` data changes.
  useEffect(() => {
    // Check if a title was passed, data is loaded, and the ref is ready
    if (title && sections.length > 0 && sectionListRef.current) {
      // Find the index of the section that matches the title
      const sectionIndex = sections.findIndex(section => section.title === title);
      
      // If the section is found, scroll to it
      if (sectionIndex !== -1) {
        setTimeout(() => { // Use a short timeout to ensure the list has rendered
          sectionListRef.current.scrollToLocation({
            animated: true,
            sectionIndex,
            itemIndex: 0,
            viewOffset: 10, // Optional vertical offset
          });
        }, 100);
      }
    }
  }, [title, sections, loading]); // Depend on title and the loaded sections/loading state

  const handleSubcategoryPress = (subcategory) => {
    router.push(`/products/${subcategory._id}?title=${encodeURIComponent(subcategory.name)}`);
  };
  
  const renderSectionGrid = ({ item }) => {
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
        <ActivityIndicator size="large" color="#222" /><Text>Loading Categories...</Text>
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
      ref={sectionListRef} // Attach the ref to the SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeaderText}>{title}</Text>
      )}
      renderItem={renderSectionGrid}
    />
  );
}

// --- STYLES (No changes needed here) ---
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