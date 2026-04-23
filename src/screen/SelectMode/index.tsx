import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import styles from "./styles";
import { Header, AppGradient } from "../../components";
import { colors } from "../../constants/colors";

const SelectMode = ({ navigation }: any) => {

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.container}>
                <Header title="Select Mode" onBackPress={() => navigation.goBack()} />
                <View style={styles.emptySpace} />
                <AppGradient style={styles.modeContainer}>
                    <TouchableOpacity style={styles.modeItem} onPress={() => navigation.navigate('SelectLevel', { difficulty: 'Easy' })}>
                        <Ionicons name="play-circle-outline" size={50} color={colors.light.LightPine} />
                        <Text style={styles.medium}>Easy</Text>
                    </TouchableOpacity>
                    <View style={styles.devider} />

                    <TouchableOpacity style={styles.modeItem} onPress={() => navigation.navigate('UnblockCube', { difficulty: 'Medium' })}>
                        <Ionicons name="trending-up-outline" size={50} color={colors.light.LightPine} />
                        <Text style={styles.medium}>Medium</Text>
                    </TouchableOpacity>
                    <View style={styles.devider} />

                    <TouchableOpacity style={styles.modeItem} onPress={() => navigation.navigate('UnblockCube', { difficulty: 'Hard' })}>
                        <Ionicons name="warning-outline" size={50} color={colors.light.LightPine} />
                        <Text style={styles.medium}>Hard</Text>
                    </TouchableOpacity>
                    <View style={styles.devider} />

                    <TouchableOpacity style={styles.modeItem} onPress={() => navigation.navigate('UnblockCube', { difficulty: 'Expert' })}>
                        <Ionicons name="ribbon-outline" size={50} color={colors.light.LightPine} />
                        <Text style={styles.medium}>Expert</Text>
                    </TouchableOpacity>
                    <View style={styles.devider} />

                    <TouchableOpacity style={styles.modeItem} onPress={() => navigation.navigate('UnblockCube', { difficulty: 'Classic' })}>
                        <Ionicons name="apps-outline" size={50} color={colors.light.LightPine} />
                        <Text style={styles.medium}>Classic</Text>
                    </TouchableOpacity>
                </AppGradient>
                <View style={styles.emptySpace} />

            </View>
        </SafeAreaView>
    );
};

export default SelectMode;