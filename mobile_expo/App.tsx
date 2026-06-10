import { StatusBar } from 'expo-status-bar';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMemo, useState } from 'react';

type PlanKey = 'free' | 'pro' | 'premium_plus';

const planLabels: Record<PlanKey, string> = {
  free: 'Free',
  pro: 'Pro',
  premium_plus: 'Premium Plus',
};

const APP_STORE_URL = process.env.EXPO_PUBLIC_APP_STORE_URL || 'https://apps.apple.com';
const GOOGLE_PLAY_URL = process.env.EXPO_PUBLIC_GOOGLE_PLAY_URL || 'https://play.google.com/store';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:3000';

export default function App() {
  const [topic, setTopic] = useState('Wrzucam film o AI dla tworcow i chce publikacje na wszystkie platformy.');
  const [plan, setPlan] = useState<PlanKey>('premium_plus');
  const [oneClickPublish, setOneClickPublish] = useState(true);
  const [contentBrain, setContentBrain] = useState(true);

  const coachInsight = useMemo(() => {
    if (!contentBrain) return 'AI Content Brain jest wylaczony.';
    return 'Twoje filmy o AI osiagaja o 70% wiecej wyswietlen niz filmy o programowaniu. Publikuj 18:00-20:00.';
  }, [contentBrain]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topCard}>
          <Text style={styles.topEyebrow}>USInf.com Mobile</Text>
          <Text style={styles.topTitle}>Android i iOS ready</Text>
          <Text style={styles.topSubtitle}>
            Ta wersja mobilna jest szybkim workflow do publikacji i coachingu. Desktop zostaje jako panel dowodzenia, a mobile jako szybka praca w terenie.
          </Text>
          <View style={styles.linkRow}>
            <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(APP_STORE_URL)}>
              <Text style={styles.linkButtonText}>App Store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(GOOGLE_PLAY_URL)}>
              <Text style={styles.linkButtonText}>Google Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkButton, styles.linkButtonGhost]} onPress={() => Linking.openURL(WEB_URL)}>
              <Text style={styles.linkButtonGhostText}>Web</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.eyebrow}>AI Growth OS Mobile</Text>
        <Text style={styles.title}>One Click Publish</Text>
        <Text style={styles.subtitle}>
          Mobile-first ekran dla Android i iOS: wrzucasz temat/film i od razu tworzysz pakiet tresci pod TikTok, Shorts, Reels, Facebook i X.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Temat filmu</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            multiline
            style={styles.input}
            placeholder="Wpisz temat lub wklej link"
            placeholderTextColor="#6B7280"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Plan</Text>
          <View style={styles.planRow}>
            {(Object.keys(planLabels) as PlanKey[]).map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setPlan(item)}
                style={[styles.planChip, plan === item ? styles.planChipActive : null]}
              >
                <Text style={[styles.planChipText, plan === item ? styles.planChipTextActive : null]}>{planLabels[item]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Premium Plus: One Click Publish</Text>
              <Text style={styles.switchHint}>Automatyczne opisy, hashtagy, miniatura i publikacja.</Text>
            </View>
            <Switch value={oneClickPublish} onValueChange={setOneClickPublish} />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>AI Content Brain</Text>
              <Text style={styles.switchHint}>Uczenie sie na wynikach Twojego kanalu i rekomendacje wzrostu.</Text>
            </View>
            <Switch value={contentBrain} onValueChange={setContentBrain} />
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Publish Everywhere</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AI Growth Coach</Text>
          <Text style={styles.coachText}>{coachInsight}</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>+34%</Text>
              <Text style={styles.metricLabel}>Wzrost 30 dni</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>87/100</Text>
              <Text style={styles.metricLabel}>Growth Score</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>18:00-20:00</Text>
              <Text style={styles.metricLabel}>Best publish time</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  container: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    color: '#0E7490',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  card: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topCard: {
    backgroundColor: '#08111F',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  topEyebrow: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  topTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  topSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#CBD5E1',
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  linkButtonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  linkButtonGhostText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    marginTop: 8,
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#0F172A',
  },
  planRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  planChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  planChipActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0284C7',
  },
  planChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  planChipTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#475569',
  },
  primaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  coachText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  metricsRow: {
    marginTop: 12,
    gap: 8,
  },
  metricBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0369A1',
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 12,
    color: '#475569',
  },
});
