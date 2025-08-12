import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Mock data for offers. You can replace this with data from your API.
const offersData = [
  {
    id: "1",
    title: "50% Off on All Vegetables",
    description: "Get fresh vegetables at half the price. Limited time offer!",
    icon: "leaf-outline",
    colors: ["#66BB6A", "#81C784"],
    imageUrl: "https://placehold.co/600x400/66BB6A/FFFFFF?text=Veggies",
  },
  {
    id: "2",
    title: "Buy 1 Get 1 Free on Dairy",
    description: "Stock up on milk, cheese, and more with our BOGO offer.",
    icon: "water-outline",
    colors: ["#42A5F5", "#64B5F6"],
    imageUrl: "https://placehold.co/600x400/42A5F5/FFFFFF?text=Dairy",
  },
  {
    id: "3",
    title: "20% Cashback on Pantry Staples",
    description: "Save more on your monthly groceries. Cashback credited instantly.",
    icon: "wallet-outline",
    colors: ["#FFA726", "#FFB74D"],
    imageUrl: "https://placehold.co/600x400/FFA726/FFFFFF?text=Pantry",
  },
  {
    id: "4",
    title: "Free Delivery on Orders Above $50",
    description: "Shop for $50 or more and get your order delivered for free.",
    icon: "bicycle-outline",
    colors: ["#EC407A", "#F06292"],
    imageUrl: "https://placehold.co/600x400/EC407A/FFFFFF?text=Delivery",
  },
];

const OfferCard = ({ offer }) => {
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <LinearGradient
        colors={offer.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardIconContainer}>
          <Ionicons name={offer.icon} size={32} color="#fff" />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{offer.title}</Text>
          <Text style={styles.cardDescription}>{offer.description}</Text>
        </View>
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: offer.imageUrl }}
            style={styles.cardImage}
            onError={(e) => console.log(e.nativeEvent.error)}
          />
        </View>
        <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward-outline" size={24} color="rgba(255, 255, 255, 0.7)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function OffersScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Special Offers</Text>
        <Text style={styles.screenSubtitle}>
          Grab these amazing deals before they're gone!
        </Text>
        {offersData.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden', // Ensures the image corners are rounded
  },
  cardIconContainer: {
    marginRight: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 18,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  cardImageContainer: {
    position: 'absolute',
    right: -40,
    bottom: -30,
    opacity: 0.1,
    transform: [{ rotate: '-20deg' }],
  },
  cardImage: {
    width: 150,
    height: 150,
  },
  arrowContainer: {
      marginLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
  }
});
