import { Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  startLevelGeneration,
  importLevelsFromJson,
} from "../../redux/levelService";
import { useRealm } from "../../database/realmContext";
const levelsData = require("../../assets/levels.json");

import styles from "./styles";
import { ThemeButton } from "../../components/ThemeButton";
import { AppGradient } from "../../components/AppGradient";
import { colors } from "../../constants/colors";

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const realm = useRealm();
  const lastGeneratedLevel = useAppSelector((state) => state.game.lastGeneratedLevel);
  const isGenerating = useAppSelector((state) => state.game.isGenerating);

  useEffect(() => {
    if (!isGenerating && lastGeneratedLevel <= 1000) {
      if (levelsData && levelsData.length > 0) {
        console.log("Levels data found, starting import...");
        importLevelsFromJson(dispatch, realm, levelsData);
      } else {
        console.log("No levels data found in JSON, starting generation...");
        startLevelGeneration(dispatch, realm, lastGeneratedLevel);
      }
    }
  }, [dispatch, realm, lastGeneratedLevel, isGenerating]);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <AppGradient style={styles.logoContainer}>
          <View style={styles.logoUnblockWrapper}>
            <Text style={styles.logoLayer1}>Unblock</Text>
            <Text style={styles.logoLayer2}>Unblock</Text>
            <Text style={styles.logoMain}>Unblock</Text>
          </View>
          <View style={styles.logoCubeWrapper}>
            <Text style={styles.logoLayer1}>Cube</Text>
            <Text style={styles.logoLayer2}>Cube</Text>
            <Text style={styles.logoMain}>Cube</Text>
          </View>
        </AppGradient>
        <View style={styles.buttonContainer}>
          <ThemeButton
            title="Play"
            onPress={() => navigation.navigate("UnblockCube")}
          />
          <ThemeButton
            title="Select Menu"
            onPress={() => navigation.navigate("SelectMode")}
          />
          <ThemeButton
            title="WoodPalette"
            onPress={() => navigation.navigate("WoodPalette")}
          />
        </View>
        <View style={styles.cubeListContainer}>
          <TouchableOpacity
            style={styles.cubeWrapper}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <AppGradient style={styles.cubeContainer}>
              <Ionicons
                name="settings"
                size={42}
                color={colors.light.LightPine}
              />
            </AppGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cubeWrapper}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <AppGradient style={styles.cubeContainer}>
              <Ionicons name="gift" size={42} color={colors.light.LightPine} />
            </AppGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cubeWrapper}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <AppGradient style={styles.cubeContainer}>
              <Ionicons name="flag" size={42} color={colors.light.LightPine} />
            </AppGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cubeWrapper}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <AppGradient style={styles.cubeContainer}>
              <Ionicons
                name="megaphone"
                size={42}
                color={colors.light.LightPine}
              />
            </AppGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
