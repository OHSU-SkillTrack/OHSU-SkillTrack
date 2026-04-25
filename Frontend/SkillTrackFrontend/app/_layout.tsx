import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SkillTrackAuth } from "@/components/auth/SkillTrackAuth";
import config from "../src/amplifyconfiguration.json";

Amplify.configure(config);

export default function RootLayout() {
	useFonts({
		Afacad: require("../assets/fonts/static/Afacad-Regular.ttf"),
	});

	return (
		<Authenticator.Provider>
			<SkillTrackAuth>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(student)" />
					<Stack.Screen name="(instructor)" />
				</Stack>
			</SkillTrackAuth>
		</Authenticator.Provider>
	);
}