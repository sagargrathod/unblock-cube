import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: colors.dark.BurntWood,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.LightTeak,
  },
  headerContainer: {
    backgroundColor: colors.dark.DeepWood,
  },
  mainContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 8, // Added moderate padding
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  footerContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  footerPadding: {
    height: 32,
  },
  loadMoreButton: {
    backgroundColor: colors.dark.GoldenBrown,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.light.LightPine,
  },
  loadMoreText: {
    color: colors.light.LightPine,
    fontSize: 16,
    fontWeight: "bold",
  },
  headerStatsText: {
    color:colors.light.LightTeak,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
