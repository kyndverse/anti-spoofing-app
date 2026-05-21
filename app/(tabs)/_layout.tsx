import { colors } from "@/lib/colors";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, useWindowDimensions, View } from "react-native";

const WEB_MAX_WIDTH = 430;

const TabsLayout = () => {
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web";

  const barWidth = isWeb ? Math.min(width, WEB_MAX_WIDTH) : width;
  const tabBarHeight = isWeb ? 68 : 82;
  const buttonSize = isWeb ? 56 : Math.min(width * 0.16, 68);
  const iconSize = isWeb ? 24 : 28;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,

        tabBarStyle: {
          position: "absolute",
          bottom: 0,

          width: barWidth,
          height: tabBarHeight,

          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",

          paddingTop: 0,
          paddingBottom: 0,

          elevation: 0,
          shadowOpacity: 0,

          ...(isWeb
            ? {
                left: (width - barWidth) / 2,
              }
            : {
                left: 0,
                right: 0,
              }),
        },

        tabBarItemStyle: {
          height: tabBarHeight,
          alignItems: "center",
          justifyContent: "center",
        },

        tabBarIconStyle: {
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                backgroundColor: colors.active,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: -14 }],
              }}
            >
              <Feather name="camera" size={iconSize} color="white" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
