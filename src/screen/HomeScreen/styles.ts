import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

const styles = StyleSheet.create
    ({
        safeAreaView: {
            flex: 1,
            backgroundColor: colors.light.LightPine,
        },
        container: {
            flex: 1,
            justifyContent: 'space-between',
            backgroundColor: colors.light.LightPine,
            margin: 16,
        },
        logoContainer: {
            width: '100%',
            height: 200,
            borderRadius: 20,
            backgroundColor: colors.dark.DarkGoldenBrown,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: colors.dark.DarkGoldenBrown,
            overflow: 'hidden',
        },
        logoUnblockWrapper: {
            marginLeft: -100,
        },
        logoCubeWrapper: {
            marginLeft: 100,
        },
        logoLayer1: {
            position: 'absolute',
            fontSize: 50,
            fontWeight: 'bold',
            color: colors.dark.DeepWood,
            top: 4,
            left: 3,
        },
        logoLayer2: {
            position: 'absolute',
            fontSize: 50,
            fontWeight: 'bold',
            color: colors.dark.DarkOak,
            top: 2,
            left: 2,
        },
        logoMain: {
            fontSize: 50,
            fontWeight: 'bold',
            color: colors.light.LightPine,
        },
        buttonContainer: {
            flex: 1,
            marginTop: '25%',
            width: '100%',
            gap: 16,
        },
        cubeWrapper: {
            flex: 1,
            height: 50,
        },
        cubeContainer: {
            flex: 1,
            backgroundColor: colors.dark.DarkGoldenBrown,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: colors.dark.DarkGoldenBrown,
            overflow: 'hidden',
        },
        cubeListContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 16,
        },
        flatList: {
            flex: 1,
        },
        flatListContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    })
export default styles;