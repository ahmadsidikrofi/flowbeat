import { Text, View } from "react-native";
import SingleDataCard from "@/components/SingleDataCard"

const FavouriteContent = ({ title }) => {
    return ( 
        <View>
            <Text style={{ fontSize: 20, fontWeight: '400', width: '100%' }}>{title}</Text>
            <SingleDataCard />
        </View>
    );
}
 
export default FavouriteContent;