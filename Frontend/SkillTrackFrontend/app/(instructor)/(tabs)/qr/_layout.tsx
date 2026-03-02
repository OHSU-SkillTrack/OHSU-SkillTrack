// this layout file will describe a STACK navigator for our QR Code Checkoff Flow

import { Stack } from "expo-router";

export default function QRStackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false}}/>
            <Stack.Screen name="studentDetails" options={{ headerShown: false}}/>
            <Stack.Screen name="courseDetails" options={{ headerShown: false}}/>
            <Stack.Screen name="skillDetails" options={{ headerShown: false}}/>
        </Stack>
    )
}