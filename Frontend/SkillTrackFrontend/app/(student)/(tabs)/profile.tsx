// insert resources page here after reading comments below!
import { View, Pressable } from 'react-native'
import { signOut } from 'aws-amplify/auth'
import { AppText } from "@/components/AppText"

export default function Tab() {
    // be sure to copy/use similar logic for the signout button on new profile page
    const handleLogout = async () => {
        try {
            await signOut();
            // The app will automatically show the login screen
            // because Authenticator will detect the user is signed out
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    return (
        <View>
            <AppText>Profile page!</AppText>
            <Pressable onPress={handleLogout}>
                <AppText >Logout</AppText>
            </Pressable>
        </View>
    );
}