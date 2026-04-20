import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GameMenuScreen from './src/screen/GameMenuScreen';
import UnblockCubeGameScreen from './src/screen/UnblockCubeGameScreen';
import WoodPaletteScreen from './src/screen/WoodPaletteScreen';
import HomeScreen from './src/screen/HomeScreen';
import SelectMode from './src/screen/SelectMode';

const Stack = createStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="GameMenu" component={GameMenuScreen} />
            <Stack.Screen name="UnblockCube" component={UnblockCubeGameScreen} />
            <Stack.Screen name="WoodPalette" component={WoodPaletteScreen} />
            <Stack.Screen name="SelectMode" component={SelectMode} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
