import { COLORS } from "@/utils/constant";
import React from "react";
import {
  StyleSheet,
  TouchableOpacityProps,
  TouchableOpacity,
} from "react-native";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

type Variants = "primary" | "secondary" | "outline";

type TButton = TouchableOpacityProps & {
  variant?: Variants;
  children: React.ReactNode;
};

const Button = ({ variant = "primary", children, ...otherProps }: TButton) => {
  return (
    <TouchableOpacity
      {...otherProps}
      style={[
        styles.base,
        variantStyles[variant],
        otherProps.disabled ? { backgroundColor: COLORS.BRAND[300] } : {},
        otherProps.style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 4,

    minWidth: 120,
  },
});

const variantStyles: Record<Variants, ViewStyle> = {
  primary: {
    backgroundColor: COLORS.BRAND[500],
  },
  outline: {
    borderWidth: 2,
    borderColor: COLORS.BRAND[500],
  },
  secondary: {
    backgroundColor: COLORS.SECONDARY[500],
  },
};

export default Button;
