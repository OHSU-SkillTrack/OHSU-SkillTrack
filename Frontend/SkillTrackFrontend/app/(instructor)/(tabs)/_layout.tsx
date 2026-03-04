import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function InstructorTabs() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: () => (
                        <Ionicons name="person-outline" size={30} color="#000000"/>
                    )
                }}
            />

            <Tabs.Screen
                name="courses"
                options={{
                    title: "Courses",
                    tabBarIcon: () => (
                        <Ionicons name="book-outline" size={30} color="#000000"/>
                    )
                }}
            />

            <Tabs.Screen 
                name="camera"
                options={{
                    tabBarIcon: () => (
                        <Ionicons name="camera-outline" size={30} color={"#000000"}/>
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
    )
}