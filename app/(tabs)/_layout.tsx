import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { COLORS } from "@/utils/constant";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: COLORS.BRAND[400],
          tabBarInactiveTintColor: COLORS.NEUTRAL[500],
          tabBarIcon: ({ color }) => (
            <IconSymbol size={30} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: COLORS.BRAND[500],
          tabBarInactiveTintColor: COLORS.NEUTRAL[500],
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
