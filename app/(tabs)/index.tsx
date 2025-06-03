import ScreenLayout from "@/components/ScreenLayout";
import { COLORS } from "@/utils/constant";
import { Image, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScreenLayout>
      <View style={styles.homeContainer}>
        {/* Package Container */}
        <View style={styles.packageContainer}>
          <Image source={require("@/assets/images/bubble.png")} />
          <Image source={require("@/assets/images/dropbox.png")} />

          {/* Text Content for absolute positioning */}
          <View style={styles.textContent}>
            <Text style={styles.statuText}>Delivery Made</Text>
            <Text style={styles.messageText}>
              Hey! A parcel was just dropped by. Kindly check it immediately
            </Text>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeContent}>July 25, 2025</Text>
              <Text style={styles.dateTimeContent}>8:00 PM</Text>
            </View>
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    padding: 32,
  },
  packageContainer: {
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
  },
  textContent: {
    display: "flex",
    height: 140,
    gap: 5,
    position: "absolute",
    top: 10,
    left: 40,
    maxWidth: 230,
  },
  statuText: {
    color: COLORS.BRAND[700],
    fontSize: 12,
    fontWeight: "medium",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 20,
    flex: 1,
    fontWeight: "bold",
  },
  dateTimeContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  dateTimeContent: {
    color: COLORS.BRAND[700],
    fontSize: 10,
  },
});
