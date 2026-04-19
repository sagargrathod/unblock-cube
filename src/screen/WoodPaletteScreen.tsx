import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, colors } from '../constants/colors';

export default function WoodPaletteScreen({ navigation }: any) {
  const renderCube = (color: { hex: string, name: string }) => (
    <View key={color.hex} style={styles.cubeContainer}>
      <View style={[styles.cube, { backgroundColor: color.hex }]} />
      <Text style={styles.colorName}>{color.name}</Text>
      <Text style={styles.hexCode}>{color.hex}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wood Palette</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Light Woods</Text>
        <View style={styles.paletteGrid}>
          {Object.entries(colors.light).map(([name, hex]) => 
            renderCube({ hex, name: name.replace(/([A-Z])/g, ' $1').trim() })
          )}
        </View>

        <Text style={styles.sectionTitle}>Dark Woods</Text>
        <View style={styles.paletteGrid}>
          {Object.entries(colors.dark).map(([name, hex]) => 
            renderCube({ hex, name: name.replace(/([A-Z])/g, ' $1').trim() })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.theme.background || '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: COLORS.theme.text || '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.theme.text || '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.theme.primary || '#FFD700',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.theme.surface || '#333333',
    paddingBottom: 5,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  cubeContainer: {
    alignItems: 'center',
    width: 100,
    marginBottom: 15,
  },
  cube: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  colorName: {
    color: COLORS.theme.text || '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  hexCode: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 2,
  },
});
