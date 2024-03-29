import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./components/Home";
import Repeat from "./components/Repeat"; // Corrected import statement
import { Ionicons } from "@expo/vector-icons";
import Settings from "./components/Settings";

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerTitleAlign: "center",
          tabBarActiveBackgroundColor: "purple",
          activeColor: "white",
          inactiveColor: "purple",
          tabBarActiveTintColor: "white", // Set active color to red
          tabBarInactiveTintColor: "purple", // Set inactive color to white
          tabBarLabelStyle: {
            fontSize: 9.6, // Adjust the font size as needed
            fontWeight: "400",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitleStyle: {
              color: "white",
            },
            headerStyle: {
              backgroundColor: "purple",
            },
            labelStyle: {
              fontSize: 10,
              margin: 0,
              padding: 0,
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-home" size={24} color={color} />
            ),
            tabBarLabel: "Home",
            tabBarLabelStyle: {
              color: "black",
            },
            tabBarStyle: {
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        />
        <Tab.Screen
          name="Repeat"
          component={Repeat}
          options={{
            headerTitleStyle: {
              color: "white",
            },
            headerStyle: {
              backgroundColor: "purple",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-repeat" size={24} color={color} />
            ),
            tabBarLabel: "Repeat",
            tabBarLabelStyle: {
              color: "black",
            },
            tabBarStyle: {
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        />

        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            headerTitleStyle: {
              color: "white",
            },
            headerStyle: {
              backgroundColor: "purple",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-settings" size={24} color={color} />
            ),
            tabBarLabel: "Settings",
            tabBarLabelStyle: {
              color: "black",
            },
            tabBarStyle: {
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
