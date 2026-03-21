import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const PortfolioTracker = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Markowitz Optimizer Vault</Text>
      <Text style={styles.subtitle}>Directly streaming PyPortfolioOpt matrices into your iOS/Android native viewport.</Text>

      <View style={[styles.card, { borderLeftColor: '#8b5cf6', borderLeftWidth: 4 }]}>
        <Text style={styles.metricTitle}>Total Capital Risk (VaR)</Text>
        <Text style={styles.metricRisk}>-$4,215.50 (95% Conf.)</Text>
        <Text style={styles.metricDesc}>Maximum calculated daily drawdown assuming Standard Normal distribution tails.</Text>
      </View>

      <View style={[styles.card, { borderLeftColor: '#10b981', borderLeftWidth: 4 }]}>
        <Text style={styles.metricTitle}>Sharpe Ratio (Annualized)</Text>
        <Text style={styles.metricGreen}>2.45</Text>
        <Text style={styles.metricDesc}>Extremely high risk-adjusted return metric powered by dynamic Kelly Criterion sizing.</Text>
      </View>

      <View style={[styles.card, { borderLeftColor: '#f59e0b', borderLeftWidth: 4 }]}>
        <Text style={styles.metricTitle}>Deployed Open Algorithmic Capital</Text>
        <Text style={styles.metricYellow}>$205,000 / $500,000</Text>
        <Text style={styles.metricDesc}>Current utilization constrained strictly by institutional portfolio bounds.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  metricTitle: { color: '#cbd5e1', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricRisk: { color: '#ef4444', fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  metricGreen: { color: '#10b981', fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  metricYellow: { color: '#f59e0b', fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  metricDesc: { color: '#64748b', fontSize: 13 }
});
