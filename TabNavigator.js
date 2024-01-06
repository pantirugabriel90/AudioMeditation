// TabNavigator.js
import { createBottomTabNavigator } from 'react-navigation-tabs';
import HomeScreen from './components/Home';
import SettingsScreen from './components/Settings';

const TabNavigator = createBottomTabNavigator({
  Home: HomeScreen,
  Settings: SettingsScreen,
});

export default TabNavigator;
