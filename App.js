import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./components/Home";
import SecondScreen from "./components/SecondScreen";
import { Ionicons } from "@expo/vector-icons";
import Settings from "./components/Settings";
import Tutorial from "./components/Tutorial";

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-home" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SecondScreen"
          component={SecondScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-repeat" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-settings" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="tutorial"
          component={Tutorial}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-settings" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
