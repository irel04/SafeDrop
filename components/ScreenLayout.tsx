import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";

type TScreenLayout = {
  children: React.ReactNode;
};
const ScreenLayout = ({ children }: TScreenLayout) => {
  return (
    <SafeAreaView style={styles.screenLayoutContainer}>{children}</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenLayoutContainer: {
    flex: 1,
    marginTop: 35,
    display: "flex",
    flexDirection: "column",
  },
});

export default ScreenLayout;
