import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

// In production React Native, we would use a local IP mapping or ngrok bridge instead of localhost.
const API_BASE = 'http://10.0.2.2:5000/api'; 

export const TradingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching normalized CCXT crypto order book data
    setTimeout(() => {
      setData({
        symbol: 'BTC/USDT',
        lastPrice: 64205.50,
        pctChange: 2.45,
        status: 'LIVE_STREAMING'
      });
      setLoading(false);
    }, 800);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quant Terminal</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>Mobile Sync Active</Text></View>
      </View>

      <Text style={styles.subtitle}>Unified Global execution bridging TradingView and Binance webhooks natively to your device.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CCXT Core Streaming Matrix</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Symbol:</Text>
            <Text style={styles.value}>{data.symbol}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Execution Price:</Text>
            <Text style={[styles.value, { color: '#10b981', fontSize: 24 }]}>
              ${data.lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>24h Delta:</Text>
            <Text style={[styles.value, { color: data.pctChange >= 0 ? '#10b981' : '#ef4444' }]}>
              +{data.pctChange}%
            </Text>
          </View>
        </View>
      )}

      {/* Placeholder for TradingView native Mobile WebView integration */}
      <View style={[styles.card, { borderColor: '#2962FF', borderLeftWidth: 4 }]}>
          <Text style={styles.cardTitle}>TradingView Algorithmic Link</Text>
          <Text style={{color: '#94a3b8', fontSize: 13}}>PineScript triggers running on TradingView.com are actively routed here.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  badge: { backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#f59e0b' },
  badgeText: { color: '#f59e0b', fontSize: 12, fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  label: { color: '#94a3b8', fontSize: 14 },
  value: { color: 'white', fontSize: 16, fontWeight: '600' }
});
