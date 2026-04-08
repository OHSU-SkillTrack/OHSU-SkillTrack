import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminTabs() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
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
                    tabBarIcon: () => (
                        <Ionicons name="person-outline" size={30} color="#000000"/>
                    )
                }}
            />

            <Tabs.Screen
                name="templates"
                options={{
                    title:"Templates",
                    tabBarIcon: () => (
                        <Ionicons name="book-outline" size={30} color="#000000"/>
                    )
                }}
            />



            <Tabs.Screen
                name="addUsers"
                options={{
                    title:"Add Users",
                    tabBarIcon: () => (
                        <Ionicons name="person-add-outline" size={30} color="#000000"/>
                    )
                }}
            />

            
        </Tabs>
    )
}