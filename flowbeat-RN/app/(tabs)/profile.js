import { SafeAreaView, ScrollView, Text, View } from "react-native"
import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';
import CreateAccount from "../../components/UserProfile/CreateAccount";
import LocalProfile from "../../components/UserProfile/LocalProfile";

const ProfileScreen = () => {
    return (
        <ThemedView style={{ flex: 1 }}>
            <CreateAccount />
            <LocalProfile />
        </ThemedView>
    )
}
export default ProfileScreen