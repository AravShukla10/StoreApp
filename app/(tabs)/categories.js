import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'; // UPDATED: Imported useFocusEffect
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SubcategoryCard = ({ subcategory, onPress, isInStock }) => (
  <TouchableOpacity
    style={styles.categoryCardContainer}
    onPress={isInStock ? onPress : null}
    activeOpacity={isInStock ? 0.7 : 1}
  >
    <View style={styles.categoryCard}>
      <Image
        source={{ uri: subcategory.imageUrl || 'https://placehold.co/150x150/e2e8f0/e2e8f0' }}
        style={[styles.categoryImage, !isInStock && styles.disabledImage]}
      />
      {!isInStock && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>No Stock</Text>
        </View>
      )}
      <Text style={[styles.categoryName, !isInStock && styles.disabledText]} numberOfLines={2}>
        {subcategory.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function Categories() {
  const router = useRouter();
  const sectionListRef = useRef(null);
  const params = useLocalSearchParams();
  const { title } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const [inStockSubcatIds, setInStockSubcatIds] = useState(new Set());

  // --- UPDATED: fetchData now handles silent refreshing ---
  const fetchData = useCallback(async () => {
    // Only show the full-screen loader on the initial load.
    if (sections.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const [categoriesResponse, itemsResponse] = await Promise.all([
          fetch('https://storeapp-uqap.onrender.com/api/categories'),
          fetch('https://storeapp-uqap.onrender.com/api/items/shop/687631e69d85fbc4f3f85c78')
      ]);
      
      if (!categoriesResponse.ok) throw new Error(`HTTP error fetching categories! status: ${categoriesResponse.status}`);
      if (!itemsResponse.ok) throw new Error(`HTTP error fetching items! status: ${itemsResponse.status}`);

      const categoriesData = await categoriesResponse.json();
      const allItems = await itemsResponse.json();
      
      const stockMap = new Set();
      allItems.forEach(item => {
          if (item.quantity_avl > 0 && item.subcategory) {
              stockMap.add(item.subcategory.toString());
          }
      });
      setInStockSubcatIds(stockMap);

      const formattedData = categoriesData
        .filter(category => category.subcategories.length > 0)
        .map(category => ({
          title: category.name,
          data: [{ id: category._id, subcategories: category.subcategories }], 
        }));
      setSections(formattedData);

    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError(`Failed to load categories: ${e.message}`);
    } finally {
      // Always hide the loader after a fetch attempt.
      setLoading(false);
    }
  }, [sections.length]); // Dependency ensures this function is stable but can react to initial load state.

  // --- UPDATED: useEffect is replaced with useFocusEffect for refreshing ---
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (title && sections.length > 0 && sectionListRef.current) {
      const sectionIndex = sections.findIndex(section => section.title === title);
      
      if (sectionIndex !== -1) {
        setTimeout(() => {
          sectionListRef.current.scrollToLocation({
            animated: true,
            sectionIndex,
            itemIndex: 0,
            viewOffset: 10,
          });
        }, 100);
      }
    }
  }, [title, sections, loading]);

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
            isInStock={inStockSubcatIds.has(subcategory._id)}
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
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SectionList
      ref={sectionListRef}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 20, marginBottom: 10, marginLeft: 16 },
  sectionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', paddingHorizontal: 8 },
  categoryCardContainer: { width: '25%', padding: 8 },
  categoryCard: { alignItems: 'center', position: 'relative' },
  categoryImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0' },
  categoryName: { marginTop: 8, fontSize: 13, fontWeight: '500', color: '#333', textAlign: 'center', height: 34 },
  retryButton: { backgroundColor: '#000000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledImage: { opacity: 0.5 },
  disabledText: { color: '#a0a0a0' },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  outOfStockText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    padding: 4,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    borderRadius: 4,
    overflow: 'hidden'
  },
});