import {
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import React from "react";

import { AppGradient } from "./AppGradient";
import { colors } from "../constants/colors";

interface ThemeButtonProps {
    title: string;
    style?: StyleProp<ViewStyle>;
    onPress: () => void;
    isGradient?: boolean;
}

export const ThemeButton = ({ title, onPress, style, isGradient = true }: ThemeButtonProps) => {
    const content = <Text style={styles.buttonText}>{title}</Text>;

    return (
        <TouchableOpacity style={[styles.wrapper, style]} onPress={onPress}>
            {isGradient ? (
                <AppGradient style={styles.button}>
                    {content}
                </AppGradient>
            ) : (
                <View style={styles.button}>
                    {content}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: "92%",
        alignSelf: 'center',
        borderRadius: 20,
        shadowColor: colors.common.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: colors.dark.DarkGoldenBrown,
        backgroundColor: colors.dark.DarkGoldenBrown,
        overflow: 'hidden',
    },
    nonGradientButton: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: colors.dark.DarkGoldenBrown,
        backgroundColor: colors.dark.DarkGoldenBrown,
        overflow: 'hidden',
    },
    buttonText: {
        color: colors.light.LightPine,
        fontSize: 16,
        fontWeight: "bold",
        textShadowColor: colors.dark.DarkGoldenBrown,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});