import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { AppGradient } from "./AppGradient";

interface HeaderProps {
  title: string;
  isBack?: boolean;
  onBackPress: () => void;
  headerContainerStyle?: StyleProp<ViewStyle>;
  isGradient?: boolean;
  titleStyle?: StyleProp<TextStyle>;
}
export const Header = ({
  title,
  isBack = true,
  onBackPress,
  headerContainerStyle,
  isGradient = false,
  titleStyle,
}: HeaderProps) => {
  const HeaderContent = (
    <>
      {isBack ? (
        <Ionicons
          name="arrow-back"
          size={28}
          color={colors.common.black}
          style={styles.backButton}
          onPress={onBackPress}
        />
      ) : null}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      </View>
    </>
  );

  if (isGradient) {
    return (
      <AppGradient style={[styles.container, headerContainerStyle]}>
        {HeaderContent}
      </AppGradient>
    );
  }

  return (
    <View style={[styles.container, headerContainerStyle]}>
      {HeaderContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.LightPine,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark.DarkGoldenBrown,
  },
  backButton: {
    width: 24,
    height: 24,
  },
});
