import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function StudentTabs() {
    return (
        <Tabs
            initialRouteName="mainFlow/courses"
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: "#FFFFFF" }
            }}>
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: () => (
                        <Ionicons name="person-outline" size={30} color={"#FFFFFF"} />
                    )
                }}
            />
            <Tabs.Screen
                name="mainFlow/courses"
                options={{
                    title: "Courses",
                    tabBarIcon: () => (
                        <Ionicons name="checkmark-circle-outline" size={30} color={"#FFFFFF"} />
                    )
                }}
            />
            <Tabs.Screen
                name="resources"
                options={{
                    title: "Resources",
                    tabBarIcon: () => (
                        <Ionicons name="book-outline" size={30} color={"#FFFFFF"} />
                    )
                }}
            />
            <Tabs.Screen
                name="mainFlow/courseDetails"
                options={{
                    href: null,
                    tabBarItemStyle: { display: 'none' }
                }}
            />
            <Tabs.Screen
                name="mainFlow/skillDetails"
                options={{
                    href: null,
                    tabBarItemStyle: { display: 'none' }
                }}
            />
        </Tabs>
    )
}