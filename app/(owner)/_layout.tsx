import { Tabs, router } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

function CustomHeader() {
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'userId', 'userRole']);
    router.replace('/login');
  };

  return (
    <LinearGradient
      colors={["#1E88E5", "#4FC3F7"]}
      style={styles.headerGradient}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Owner Panel</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

export default function OwnerTabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        header: () => <CustomHeader />,
        tabBarActiveTintColor: "#1E88E5",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "index") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "stock") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "add-item") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: "Stock",
        }}
      />
      <Tabs.Screen
        name="add-item"
        options={{
          title: "Add Item",
        }}
      />
       <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 5,
  },
  tabBar: {
    height: 90,
    paddingBottom: 30,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 10,
    backgroundColor: '#fff',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
