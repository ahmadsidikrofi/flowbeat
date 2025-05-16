import { View, ScrollView, RefreshControl } from 'react-native';
import LatestReadings from '@/components/LatestReadings';
import { useLatestBloodPressure } from '@/utils/useLatestBloodPressure';
import HealthInsight from "@/components/HealthInsight"
import SummaryCard from "@/components/SummaryCard"
import LatestVitalSign from "@/components/LatestVitalSign" 
import EmergencyCall from "@/components/EmergencyCall"

export default function HomeScreen() {
  const { refreshing, syncData, isSuccess, latestBP, localDataBP, latestBPFromDB, historyDataFromBP, getBloodPressure } = useLatestBloodPressure()

  return (
    <ScrollView style={{ backgroundColor: '#fff' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getBloodPressure} />
      }
    >
      <View style={{ marginVertical: 24, marginHorizontal: 16 }}>
        <EmergencyCall />
        <LatestReadings title="Cek Tekanan Darah Terbaru" latestBP={latestBP} latestBPFromDB={latestBPFromDB} isSuccess={isSuccess} syncData={syncData} getBloodPressure={getBloodPressure} />
        {/* Health Insights */}
        <HealthInsight latestBP={latestBP} latestBPFromDB={latestBPFromDB} />

        {/* Latest Reading BPM */}
        <LatestVitalSign />

        {/* Summary Cards */}
        <SummaryCard localDataBP={localDataBP} historyDataFromBP={historyDataFromBP} />
      </View>
    </ScrollView>
  );
}
