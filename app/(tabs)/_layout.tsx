import { colors } from "@/lib/colors";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Dimensions, View } from "react-native";

const TabsLayout = () => {
  const { width, height } = Dimensions.get("window");

  const buttonSize = width * 0.18;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,

        tabBarStyle: {
          backgroundColor: colors.backgound,
          paddingTop: height * 0.02,
          height: height * 0.1,
          paddingBottom: height * 0.015,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: width * 0.17,
                height: width * 0.17,
                borderRadius: buttonSize / 2,
                backgroundColor: colors.active,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: -height * 0.02 }],
              }}
            >
              <Feather name="camera" size={28} color="white" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
