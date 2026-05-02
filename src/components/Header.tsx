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
  rightElement?: React.ReactNode;
}
export const Header = ({
  title,
  isBack = true,
  onBackPress,
  headerContainerStyle,
  isGradient = false,
  titleStyle,
  rightElement,
}: HeaderProps) => {
  const HeaderContent = (
    <>
      <View style={styles.leftContainer}>
        {isBack ? (
          <Ionicons
            name="arrow-back"
            size={28}
            color={colors.common.black}
            style={styles.backButton}
            onPress={onBackPress}
          />
        ) : null}
      </View>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        {rightElement}
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
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  leftContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  rightContainer: {
    flex: 1,
    paddingRight: 12,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark.DarkGoldenBrown,
  },
  backButton: {
    width: 28,
    height: 28,
  },
});
