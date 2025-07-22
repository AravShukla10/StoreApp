import { Tabs, router } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCart } from "../context/CartContext";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export default function TabLayout() {
  const { cart } = useCart();
  const cartCount = Object.keys(cart || {}).length;

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Top Header with Gradient */}
      <LinearGradient
        colors={["#1E88E5", "#4FC3F7", "#4DD0E1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Daily Need</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
            activeOpacity={0.7}
          >
            <View style={styles.profileIconContainer}>
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom Tabs */}
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 85,
            paddingBottom: 20,
            paddingTop: 15,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarActiveTintColor: "#1E88E5",
          tabBarInactiveTintColor: "#9E9E9E",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 5,
          },
          tabBarIconStyle: {
            marginTop: 5,
          },
          tabBarIcon: ({ color, size, focused }) => {
            const iconSize = focused ? size + 2 : size;

            switch (route.name) {
              case "index":
                return (
                    <Ionicons
                      name="bag-outline"
                      size={iconSize}
                      color={color}
                    />
                );
              case "cart":
                return (
                    <View style={styles.cartIconWrapper}>
                      <Ionicons
                        name="cart-outline"
                        size={iconSize}
                        color={color}
                      />
                      {cartCount > 0 && (
                        <LinearGradient
                          colors={["#FF6B6B", "#FF8E8E"]}
                          style={styles.cartBadge}
                        >
                          <Text style={styles.cartBadgeText}>
                            {String(cartCount)}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>
                );
              case "orders":
                return (
                    <Ionicons
                      name="receipt-outline"
                      size={iconSize}
                      color={color}
                    />
                );
              default:
                return null;
            }
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Shop",
            tabBarLabelStyle: styles.tabLabel,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            tabBarLabel: "Categories",
            tabBarLabelStyle: styles.tabLabel,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="offers"
          options={{
            tabBarLabel: "Offers",
            tabBarLabelStyle: styles.tabLabel,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pricetag-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            tabBarLabel: "Cart",
            tabBarLabelStyle: styles.tabLabel,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            tabBarLabel: "Orders",
            tabBarLabelStyle: styles.tabLabel,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 2,
  },
  profileButton: {
    padding: 8,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  activeTabIcon: {
    backgroundColor: "#E3F2FD",
    transform: [{ scale: 1.1 }],
  },
  cartIconWrapper: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -8,
    top: -8,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    // marginTop: 5,
  },
});
