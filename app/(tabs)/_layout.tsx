import { Tabs, usePathname } from 'expo-router';
import { View, Text, SafeAreaView, StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
  const pathname = usePathname();

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Need</Text>
        </View>

      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: 'Home', // optional label in tab bar
          }}
        />
      </Tabs>
      <Tabs.Screen
        name="cart"
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: 'Orders',
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    // backgroundColor: "black",
  },
  header: { 
    height: "10%", 
    // backgroundColor: "black", 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 20,
    paddingTop:20 
  },
  title: { 
    color: "rgb(0, 0, 0)", 
    fontSize: 20, 
    // marginLeft: 15,
    paddingTop:20
  },
});
