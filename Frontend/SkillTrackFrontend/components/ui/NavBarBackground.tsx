import { View } from "react-native";

// this component is used for the BACKGROUND of the navbar,
// any changes to the navbar's background should be made here (e.g. color, shadow, etc.)
export default function NavBarBackground() {
    return (
        <View
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 45,
              height: 50,
              borderRadius: 36,
              backgroundColor: "#4972FF",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            }}
        />
    )
}