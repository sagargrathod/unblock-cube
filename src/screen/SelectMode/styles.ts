import { StyleSheet } from "react-native";

import { colors } from "../../constants/colors";

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: colors.light.LightPine,
    },
    container: {
        flex: 1,
        margin: 16,
    },
    emptySpace: {
        flex: 1,
    },
    modeContainer: {
        justifyContent: 'center',
        gap: 16,
        backgroundColor: colors.dark.DarkGoldenBrown,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: colors.dark.DarkGoldenBrown,
        overflow: 'hidden',
        paddingVertical: 20,
    },
    medium: {
        flex: 0.8,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.light.LightPine,
    },
    devider: {
        width: '100%',
        height: 0.4,
        backgroundColor: colors.light.LightPine,
    },
    modeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginHorizontal: 16,
    }
});

export default styles;