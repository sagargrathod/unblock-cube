import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';

const GameMenuScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>Game Menu</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.shadow]}
            onPress={() => {
              navigation.navigate('UnblockCube');
            }}
          >
            <Text style={styles.buttonText}>Unblock Cube</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.shadow]}
            onPress={() => navigation.navigate('WoodPalette')}
          >
            <Text style={styles.buttonText}>Wood Palette</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.theme.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.theme.text,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: COLORS.theme.primary,
    width: '80%',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.theme.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
export default GameMenuScreen;