import { Stack } from "expo-router";

export default function TemplateLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="courseDetails" />
            <Stack.Screen name="studentDetails" />
            <Stack.Screen name="skillDetails" />
            <Stack.Screen name="addCourse" />
        </Stack>
    );
}