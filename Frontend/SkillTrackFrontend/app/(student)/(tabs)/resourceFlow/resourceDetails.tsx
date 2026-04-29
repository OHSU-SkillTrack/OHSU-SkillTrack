import { AppText } from "@/components/AppText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

export default function ResourceDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();

    return (
        <View>
            <AppText>
                {params.id}
            </AppText>
        </View>
    )
}