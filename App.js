import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SecondScreen from "./components/SecondScreen";
import HomeScreen from "./components/Home";

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="SecondScreen" component={SecondScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
