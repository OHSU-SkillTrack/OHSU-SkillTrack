import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import NavBarBackground from "../components/ui/NavBarBackground";

// this file is used to store the options for the INTERACTIVE elements of the navbar
// any changes to the navbar's buttons/icons/labels/etc. should be made here (e.g. adding a new tab, changing an icon, etc.)
export const NavBarOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarShowLabel: false,
    tabBarActiveTintColor: "#FFFFFF",
    tabBarInactiveTintColor: "rgba(255,255,255,0.85)",

    tabBarStyle: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 0,
        elevation: 0,
    },

    tabBarItemStyle: { height: 64 },

    tabBarBackground: () => <NavBarBackground />,
}