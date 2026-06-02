import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { NavBarOptions } from "@/constants/NavBarOptions";

export default function InstructorTabs() {
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
                        <Ionicons name="person-outline" size={size?? 26} color={color}/>
                    )
                }}
            />

            <Tabs.Screen
                name="courses"
                options={{
                    title: "Courses",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" size={size?? 26} color={color}/>
                    )
                }}
            />

            <Tabs.Screen 
                name="camera"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="camera-outline" size={size?? 26} color={color}/>
                    )
                }}
            />

            {/* hide QR code screen here? */}
            <Tabs.Screen
            name="qr"
            options={{
                href: null
            }}
            />
            
        </Tabs>
    );
}