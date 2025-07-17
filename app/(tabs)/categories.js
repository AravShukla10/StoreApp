import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

// This component renders a single subcategory card in the grid.
const CategoryCard = ({ category, onPress }) => (
  <TouchableOpacity style={styles.categoryCardContainer} onPress={onPress}>
    <View style={styles.categoryCard}>
      <Image
        source={{ uri: category.imageUrl || 'https://placehold.co/150x150/e2e8f0/e2e8f0' }}
        style={styles.categoryImage}
      />
      <Text style={styles.categoryName} numberOfLines={2}>
        {category.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function Categories() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);

  // This function now fetches real data from your backend.
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual server IP address if not running on localhost
      const response = await fetch('http://10.0.2.2:5000/api/categories');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      // Transform the API data into the format required by SectionList
      const formattedData = data.map(category => ({
        title: category.name,
        // The data for each section is the array of its subcategories,
        // wrapped in another array to ensure renderItem is called only once per section.
        data: [category.subcategories], 
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

  // This function handles navigation when a subcategory is pressed.
  const handleSubcategoryPress = (subcategory) => {
    console.log(`Navigating to subcategory: ${subcategory.name} (ID: ${subcategory._id})`);
    // Navigate to the product list screen, passing the subcategory's ID.
    // This assumes your product list screen file is named [subcategoryId].js
    router.push(`/products/${subcategory._id}?title=${encodeURIComponent(subcategory.name)}`);
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
      keyExtractor={(item, index) => index.toString()}
      stickySectionHeadersEnabled={false}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeaderText}>{title}</Text>
      )}
      // 'item' is now the array of subcategories for the section
      renderItem={({ item: subcategories }) => (
        <View style={styles.sectionGrid}>
          {subcategories.map(subcategory => (
            <CategoryCard
              key={subcategory._id} // Use the unique ID from the database
              category={subcategory}
              onPress={() => handleSubcategoryPress(subcategory)}
            />
          ))}
        </View>
      )}
    />
  );
}

// Styles are unchanged.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  categoryCardContainer: {
    width: '25%',
    padding: 8,
  },
  categoryCard: {
    alignItems: 'center',
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  categoryName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    height: 34,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
