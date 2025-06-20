import { Tabs, router } from 'expo-router';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
  const { cart } = useCart();
  const cartCount = Object.keys(cart || {}).length;

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily Need</Text>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Bottom Tabs */}
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            switch (route.name) {
              case 'index':
                return <Ionicons name="bag-outline" size={size} color={color} />;
              case 'cart':
                return (
                  <View>
                    <Ionicons name="cart-outline" size={size} color={color} />
                    {cartCount > 0 && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{String(cartCount)}</Text>
                      </View>
                    )}
                  </View>
                );
              case 'orders':
                return <Ionicons name="receipt-outline" size={size} color={color} />;
              default:
                return null;
            }
          },
        })}
      >
        <Tabs.Screen name="index" options={{ tabBarLabel: 'Shop' }} />
        <Tabs.Screen name="cart" options={{ tabBarLabel: 'Cart' }} />
        <Tabs.Screen name="orders" options={{ tabBarLabel: 'Orders' }} />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: { flex: 1 },
  header: {
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: '#000',
    fontSize: 20,
    paddingTop: 20,
  },
  profileButton: { paddingTop: 20 },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
