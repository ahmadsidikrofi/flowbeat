import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

export default function RiwayatBPM() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Minggu'); // Hari, Minggu, Bulan, Tahun
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [dateRange, setDateRange] = useState('');
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
            router.replace('/loginpage');
            return;
        }

        const res = await fetch(`${API_URL}/api/detak-jantung?periode=${activeTab}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            throw new Error('Gagal mengambil data');
        }

        const data = await res.json();
        setRawData(data);
        processChartData(data, activeTab);
        } catch (err) {
        console.error('Error fetching BPM data:', err);
        Alert.alert('Error', 'Gagal memuat data detak jantung');
        } finally {
        setLoading(false);
        }
    };

    const processChartData = (data, period) => {
        if (!data || data.length === 0) {
        setChartData(null);
        setDateRange('Tidak ada data');
        return;
        }

        let labels = [];
        let values = [];
        let range = '';

        switch (period) {
        case 'Hari':
            // Group by hour (last 24 hours)
            const hourlyData = groupByHour(data);
            labels = hourlyData.map(d => `${d.hour}:00`);
            values = hourlyData.map(d => d.avg);
            range = `${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`;
            break;

        case 'Minggu':
            // Group by day (last 7 days)
            const weeklyData = groupByDay(data, 7);
            labels = weeklyData.map(d => {
            const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            return `${days[d.dayOfWeek]}\n${d.date}`;
            });
            values = weeklyData.map(d => d.avg);
            
            const firstDate = new Date(data[data.length - 1].created_at);
            const lastDate = new Date(data[0].created_at);
            range = `${firstDate.getDate()} - ${lastDate.getDate()} ${lastDate.toLocaleDateString('id-ID', { month: 'long' })}`;
            break;

        case 'Bulan':
            // Group by week (last 30 days)
            const monthlyData = groupByWeek(data);
            labels = monthlyData.map(d => `Minggu ${d.week}`);
            values = monthlyData.map(d => d.avg);
            range = `${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
            break;

        case 'Tahun':
            // Group by month (last 12 months)
            const yearlyData = groupByMonth(data);
            labels = yearlyData.map(d => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return months[d.month - 1];
            });
            values = yearlyData.map(d => d.avg);
            range = `${new Date().getFullYear()}`;
            break;
        }

        setDateRange(range);
        setChartData({
        labels,
        datasets: [{ data: values.length > 0 ? values : [0] }],
        });
    };

    // Helper functions untuk grouping data
    const groupByHour = (data) => {
        const hours = {};
        data.forEach(item => {
        const date = new Date(item.created_at);
        const hour = date.getHours();
        if (!hours[hour]) hours[hour] = [];
        hours[hour].push(item.nilai);
        });

        return Object.keys(hours).map(hour => ({
        hour: parseInt(hour),
        avg: Math.round(hours[hour].reduce((a, b) => a + b, 0) / hours[hour].length),
        })).sort((a, b) => a.hour - b.hour);
    };

    const groupByDay = (data, days) => {
        const dailyData = {};
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = [];
        }

        data.forEach(item => {
        const dateStr = item.created_at.split('T')[0];
        if (dailyData[dateStr]) {
            dailyData[dateStr].push(item.nilai);
        }
        });

        return Object.keys(dailyData).map(dateStr => {
        const date = new Date(dateStr);
        const values = dailyData[dateStr];
        return {
            date: date.getDate(),
            dayOfWeek: date.getDay(),
            avg: values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
        };
        });
    };

    const groupByWeek = (data) => {
        const weeks = {};
        data.forEach(item => {
        const date = new Date(item.created_at);
        const week = Math.ceil(date.getDate() / 7);
        if (!weeks[week]) weeks[week] = [];
        weeks[week].push(item.nilai);
        });

        return Object.keys(weeks).map(week => ({
        week: parseInt(week),
        avg: Math.round(weeks[week].reduce((a, b) => a + b, 0) / weeks[week].length),
        })).sort((a, b) => a.week - b.week);
    };

    const groupByMonth = (data) => {
        const months = {};
        data.forEach(item => {
        const date = new Date(item.created_at);
        const month = date.getMonth() + 1;
        if (!months[month]) months[month] = [];
        months[month].push(item.nilai);
        });

        return Object.keys(months).map(month => ({
        month: parseInt(month),
        avg: Math.round(months[month].reduce((a, b) => a + b, 0) / months[month].length),
        })).sort((a, b) => a.month - b.month);
    };

    const getAverageBPM = () => {
        if (!rawData || rawData.length === 0) return 0;
        const sum = rawData.reduce((acc, item) => acc + item.nilai, 0);
        return Math.round(sum / rawData.length);
    };

    const getBPMStatus = (bpm) => {
        if (bpm < 60) return { text: 'Rendah', color: '#3B82F6' };
        if (bpm >= 60 && bpm <= 100) return { text: 'Normal', color: '#10B981' };
        return { text: 'Tinggi', color: '#FF9595' };
    };

    if (loading) {
        return (
        <SafeAreaView style={styles.container}>
            <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
        </SafeAreaView>
        );
    }

    const avgBPM = getAverageBPM();
    const status = getBPMStatus(avgBPM);

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
            {/* Header */}
            <Text style={styles.title}>RIWAYAT DETAK JANTUNG</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
            {['Hari', 'Minggu', 'Bulan', 'Tahun'].map((tab) => (
                <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
                >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab}
                </Text>
                </TouchableOpacity>
            ))}
            </View>

            {/* Date Range */}
            <Text style={styles.dateRange}>{dateRange}</Text>

            {/* Chart */}
            {chartData ? (
            <View style={styles.chartContainer}>
                <LineChart
                data={chartData}
                width={width - 40}
                height={280}
                chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#3B82F6',
                    },
                    propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#e0e0e0',
                    strokeWidth: 1,
                    },
                }}
                bezier
                style={styles.chart}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                withInnerLines={true}
                withOuterLines={true}
                withHorizontalLines={true}
                withVerticalLines={false}
                yAxisInterval={1}
                fromZero
                segments={6}
                />
            </View>
            ) : (
            <View style={styles.noDataContainer}>
                <Icon name="heart-outline" size={60} color="#ccc" />
                <Text style={styles.noDataText}>Tidak ada data tersedia</Text>
            </View>
            )}

            {/* Stats */}
            {rawData.length > 0 && (
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                <Text style={styles.statLabel}>Rata-rata BPM</Text>
                <Text style={[styles.statValue, { color: status.color }]}>{avgBPM}</Text>
                <Text style={[styles.statStatus, { color: status.color }]}>{status.text}</Text>
                </View>
                <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Data</Text>
                <Text style={styles.statValue}>{rawData.length}</Text>
                <Text style={styles.statStatus}>Rekaman</Text>
                </View>
            </View>
            )}

            {/* Detail Data Button */}
            <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>DETAIL DATA</Text>
            </TouchableOpacity>

            {/* Kembali Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-back-outline" size={20} color="#fff" />
            <Text style={styles.backButtonText}>KEMBALI</Text>
            </TouchableOpacity>
        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#3B82F6',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#3B82F6',
        fontWeight: 'bold',
    },
    dateRange: {
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noDataText: {
        marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginVertical: 20,
    },
    statBox: {
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailButton: {
        backgroundColor: '#3B82F6',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        flexDirection: 'row',
        backgroundColor: '#6B7280',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});