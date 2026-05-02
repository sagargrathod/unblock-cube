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
import { useIsFocused } from "@react-navigation/native";

import styles from "./styles";
import { Header, Level } from "../../components";
import { GAME_CONSTANTS } from "../../constants/game";
import { setCurrentLevel } from "../../redux/gameSlice";
import { colors } from "../../constants/colors";
import { useQuery } from "../../database/realmContext";
import { Level as LevelModel } from "../../database/schema";

const levelsData = require("../../assets/levels.json");

const SelectLevelScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const unlockedLevels = useSelector((state: any) => state.game.unlockedLevels);
  const bestMoves = useSelector((state: any) => state.game.bestMoves);
  const isGenerating = useSelector((state: any) => state.game.isGenerating);
  const isFocused = useIsFocused();

  const realmLevels = useQuery(LevelModel).sorted("levelNumber");

  const [visibleCount, setVisibleCount] = useState(GAME_CONSTANTS.TOTAL_LEVELS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Optimize lookup maps
  const levelsDataMap = useMemo(() => {
    const map: Record<number, any> = {};
    if (Array.isArray(levelsData)) {
      levelsData.forEach((l: any) => {
        map[l.levelNumber] = l;
      });
    }
    return map;
  }, []);

  const realmLevelsMap = useMemo(() => {
    const map: Record<number, any> = {};
    realmLevels.forEach((l) => {
      map[l.levelNumber] = l;
    });
    return map;
  }, [realmLevels]);

  const displayedLevels = useMemo(() => {
    return Array.from({ length: visibleCount }, (_, i) => i + 1);
  }, [visibleCount]);

  const clearedCount = useMemo(() => {
    return Object.keys(bestMoves || {}).length;
  }, [bestMoves]);

  const handleLoadMore = useCallback(() => {
    if (visibleCount >= GAME_CONSTANTS.TOTAL_LEVELS || isLoadingMore) return;

    setIsLoadingMore(true);
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
    ({ item }: { item: number }) => {
      const levelData = realmLevelsMap[item] || levelsDataMap[item];
      const best = bestMoves[item.toString()];

      return (
        <Level
          levelNumber={item}
          isLocked={item > Math.max(unlockedLevels, 100)}
          isCleared={best !== undefined && best !== null}
          levelData={levelData}
          bestMoves={best}
          onPress={handleLevelPress}
        />
      );
    },
    [
      realmLevelsMap,
      unlockedLevels,
      bestMoves,
      handleLevelPress,
      levelsDataMap,
    ],
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
        rightElement={
          <Text style={styles.headerStatsText}>
            {clearedCount}/{GAME_CONSTANTS.TOTAL_LEVELS}
          </Text>
        }
      />

      <FlatList
        data={displayedLevels}
        renderItem={renderLevel}
        keyExtractor={(item) => item.toString()}
        extraData={`${isFocused}_${clearedCount}_${unlockedLevels}`}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
};

export default SelectLevelScreen;
