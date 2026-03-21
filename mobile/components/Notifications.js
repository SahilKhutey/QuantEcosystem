import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const mockAlerts = [
  { id: '1', type: 'DRAWDOWN', severity: 'CRITICAL', msg: 'Daily P&L breached threshold limit: -$5,420', time: '10:45 AM' },
  { id: '2', type: 'LATENCY', severity: 'HIGH', msg: 'Sub-system execution API lagged > 145ms', time: '09:20 AM' },
  { id: '3', type: 'TECHNICAL', severity: 'WARN', msg: 'BTC/USDT RSI deeply oversold < 30', time: '08:15 AM' }
];

export const Notifications = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Alerts Hub</Text>
      <Text style={styles.subtitle}>Prometheus `alerts_api.py` telemetry routed natively.</Text>

      <FlatList
        data={mockAlerts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={[
            styles.alertCard, 
            item.severity === 'CRITICAL' ? { borderColor: '#991b1b', backgroundColor: 'rgba(239, 68, 68, 0.1)' } : { borderColor: '#92400e', backgroundColor: 'rgba(245, 158, 11, 0.05)' }
          ]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>[{item.type}]</Text>
              <Text style={{color: '#94a3b8', fontSize: 12}}>{item.time}</Text>
            </View>
            <Text style={{color: '#cbd5e1', fontSize: 14}}>{item.msg}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ef4444', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  alertCard: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 12 }
});
