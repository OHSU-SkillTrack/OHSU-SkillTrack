import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SkillTrackAuth } from "@/components/auth/SkillTrackAuth";
import config from "../src/amplifyconfiguration.json";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

Amplify.configure(config);

export default function RootLayout() {
	const [fontLoaded] = useFonts({
		Afacad: require("../assets/fonts/static/Afacad-Regular.ttf"),
	});

	useEffect(() => {
        if (fontLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontLoaded]);

    if (!fontLoaded) return null;

	return (
		<Authenticator.Provider>
			<SkillTrackAuth>
				<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
					<Stack.Screen name="(student)" />
					<Stack.Screen name="(instructor)" />
					<Stack.Screen name="(admin)" />
				</Stack>
			</SkillTrackAuth>
		</Authenticator.Provider>
	);
}