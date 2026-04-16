import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GameMenuScreen from './src/screen/GameMenuScreen';
import ColorSortingGameScreen from './src/screen/ColorSortingGameScreen';
import UnblockCubeGameScreen from './src/screen/UnblockCubeGameScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="GameMenu"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="GameMenu" component={GameMenuScreen} />
            <Stack.Screen name="ColorSorting" component={ColorSortingGameScreen} />
            <Stack.Screen name="UnblockCube" component={UnblockCubeGameScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
