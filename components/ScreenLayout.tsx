import React from "react";
import { View, StyleSheet } from "react-native";

type TScreenLayout = {
  children: React.ReactNode;
};
const ScreenLayout = ({ children }: TScreenLayout) => {
  return <View style={styles.screenLayoutContainer}>{children}</View>;
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
