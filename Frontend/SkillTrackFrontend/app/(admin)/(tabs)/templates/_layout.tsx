import { Stack } from "expo-router";

export default function TemplateLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="courseTemplates" />
            <Stack.Screen name="editSkill" />
            <Stack.Screen name="newSkill" />
            <Stack.Screen name="newTemplates" />
            <Stack.Screen name="skillDetails" />
        </Stack>
    );
}