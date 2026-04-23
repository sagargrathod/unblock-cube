import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useState, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";

import styles from "./styles";
import { Header, Level } from "../../components";
import { GAME_CONSTANTS } from "../../constants/game";
import { setCurrentLevel } from "../../redux/gameSlice";
import { colors } from "../../constants/colors";

const SelectLevelScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { levels, unlockedLevels, bestMoves } = useSelector(
    (state: any) => state.game,
  );
  const [visibleCount, setVisibleCount] = useState(GAME_CONSTANTS.INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // All 1000 levels are Easy for now
  const allLevelNumbers = useMemo(() => {
    return Array.from({ length: GAME_CONSTANTS.TOTAL_LEVELS }, (_, i) => i + 1);
  }, []);

  const displayedLevelsSnapshot = useMemo(() => {
    return allLevelNumbers.slice(0, visibleCount);
  }, [visibleCount, allLevelNumbers]);

  const handleLoadMore = useCallback(() => {
    if (visibleCount >= GAME_CONSTANTS.TOTAL_LEVELS || isLoadingMore) return;

    setIsLoadingMore(true);
    // Small delay to show loader and keep UI responsive
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + GAME_CONSTANTS.LOAD_BATCH, GAME_CONSTANTS.TOTAL_LEVELS),
      );
      setIsLoadingMore(false);
    }, 300);
  }, [visibleCount, isLoadingMore]);

  const handleLevelPress = useCallback(
    (levelNumber: number) => {
      dispatch(setCurrentLevel(levelNumber));
      navigation.navigate("UnblockCube");
    },
    [dispatch, navigation],
  );

  const renderLevel = useCallback(
    ({ item }: { item: number }) => (
      <Level
        levelNumber={item}
        isLocked={item > unlockedLevels}
        levelData={levels[item]}
        bestMoves={bestMoves[item]}
        onPress={handleLevelPress}
      />
    ),
    [levels, unlockedLevels, bestMoves, handleLevelPress],
  );

  const renderFooter = () => {
    if (visibleCount >= GAME_CONSTANTS.TOTAL_LEVELS)
      return <View style={styles.footerPadding} />;

    return (
      <View style={styles.footerContainer}>
        {isLoadingMore ? (
          <ActivityIndicator color={colors.dark.GoldenBrown} size="large" />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Header
        title="Select Level"
        titleStyle={styles.headerTitle}
        headerContainerStyle={styles.headerContainer}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={displayedLevelsSnapshot}
        renderItem={renderLevel}
        keyExtractor={(item) => item.toString()}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

export default SelectLevelScreen;
