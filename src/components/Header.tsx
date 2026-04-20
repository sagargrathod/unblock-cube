import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/colors";

interface HeaderProps {
    title: string;
    isBack?: boolean;
    onBackPress: () => void;

}
export const Header = ({ title, isBack = true, onBackPress }: HeaderProps) => {
    return (
        <View style={styles.container}>
            {isBack ? <Ionicons name="arrow-back" size={28} color={colors.common.black} style={styles.backButton} onPress={onBackPress} /> : null}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.LightPine,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.dark.DarkGoldenBrown,
    },
    backButton: {
        width: 24,
        height: 24,
    },
})