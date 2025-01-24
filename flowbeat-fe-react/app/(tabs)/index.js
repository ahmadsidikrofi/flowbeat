import { View, ScrollView, RefreshControl } from 'react-native';
import FavouriteContent from '../../components/FavouriteContents';
import LatestReadings from '../../components/LatestReadings';
import '@/global.css'
import { useLatestBloodPressure } from '@/utils/useLatestBloodPressure';

export default function HomeScreen() {
  const { refreshing, syncData, isSuccess, getBloodPressure, latestBP } = useLatestBloodPressure()
  
  return (
    <ScrollView style={{ backgroundColor: '#fff' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getBloodPressure} />
      }
    >
      <View className="mt-8 mx-4">
        <FavouriteContent title="Favourite Contents" />
        <LatestReadings title="Latest Readings" latestBP={latestBP} isSuccess={isSuccess} syncData={syncData} getBloodPressure={getBloodPressure} />
      </View>
    </ScrollView>
  );
}
