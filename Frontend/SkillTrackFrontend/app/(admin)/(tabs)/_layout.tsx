import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { NavBarOptions } from "@/constants/NavBarOptions";

export default function AdminTabs() {
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={NavBarOptions}
        >
            
            {/* Hide index tab */}
            <Tabs.Screen
                name="index"
                options={{
                    href: null
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size ?? 26} color={color}/>
                    )
                }}
            />

            <Tabs.Screen
                name="templates"
                options={{
                    title:"Templates",
                    unmountOnBlur: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" size={size ?? 26} color={color}/>
                    )
                }}
            />

            <Tabs.Screen
                name="addUsers"
                options={{
                    title:"Add Users",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-add-outline" size={size ?? 26} color={color}/>
                    )
                }}
            />

        </Tabs>
    )
}