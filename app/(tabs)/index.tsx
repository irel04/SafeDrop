import ScreenLayout from "@/components/ScreenLayout";
import { COLORS } from "@/utils/constant";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScreenLayout>
      <View style={styles.homeContainer}>
        <Text>Hello</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    borderColor: COLORS.BRAND[500],
    borderWidth: 2,
    padding: 32,
  },
});
