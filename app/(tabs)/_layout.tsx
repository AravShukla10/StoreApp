import { Tabs, usePathname, router } from 'expo-router';
import { View, Text, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Optional for icon button

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
  const pathname = usePathname();

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Need</Text>

        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
        <Tabs.Screen name="cart" options={{ tabBarLabel: 'Cart' }} />
        <Tabs.Screen name="orders" options={{ tabBarLabel: 'Orders' }} />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  header: {
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 👈 makes space between title and button
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: "rgb(0, 0, 0)",
    fontSize: 20,
    paddingTop: 20,
  },
  profileButton: {
    paddingTop: 20,
  },
});
