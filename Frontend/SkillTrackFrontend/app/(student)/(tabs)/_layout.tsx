// use this documentation for more info on tabs: https://docs.expo.dev/router/advanced/tabs/#dynamic-routes
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NavBarOptions } from "@/constants/NavBarOptions";

export default function TabsLayout() {
  return (
        <Tabs
          initialRouteName="index"
          screenOptions={NavBarOptions}
        >

      {/* visible tabs in our navbar */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size?? 26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mainFlow/courses"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-circle-outline"
              size={size ?? 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="resourceFlow/resources"
        options={{
          tabBarIcon: ({ color, size}) => (
            <Ionicons
              name="library-outline"
              size={size ?? 26}
              color={color}
              />
          ),
        }}
      />


      {/* hidden drill-down routes (NOT buttons) */}
      {/* <Tabs.Screen name="courses-by-year" options={{ href: null }} /> */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="mainFlow/courseDetails" options={{ href: null }} />
      <Tabs.Screen name="mainFlow/skillDetails" options={{ href: null }} />
      <Tabs.Screen name="resourceFlow/addResource" options={{ href: null }} />
      <Tabs.Screen name="resourceFlow/resourceDetails" options={{ href: null }} />
      <Tabs.Screen name="skill/[id]" options={{ href: null }} />

    </Tabs>
  );
}



//There are three screens to name: profile, courses, and resources