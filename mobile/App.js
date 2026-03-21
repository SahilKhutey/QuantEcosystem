import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TradingDashboard } from './components/TradingDashboard';
import { PortfolioTracker } from './components/PortfolioTracker';
import { Notifications } from './components/Notifications';

const Tab = createBottomTabNavigator();

/**
 * Mobile Entry Point for the Trading Engine App.
 * Provides real-time dashboarding, portfolio tracking, and instant alerting.
 */
const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={TradingDashboard} />
        <Tab.Screen name="Portfolio" component={PortfolioTracker} />
        <Tab.Screen name="Alerts" component={Notifications} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
