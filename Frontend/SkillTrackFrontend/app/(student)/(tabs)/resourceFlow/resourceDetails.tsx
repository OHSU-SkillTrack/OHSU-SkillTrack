import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';

type DrugCardFields = {
    genericName?: string;
    tradeName?: string;
    pronunciation?: string;
    therapeuticClass?: string;
    dose?: string;
    routes?: string;
    timeFrequency?: string;
    normalDosageRange?: string;
    onset?: string;
    peak?: string;
    duration?: string;
    ivCompatibility?: string;
    whyPatientGettingMed?: string;
    nursingImplications?: string;
    mechanismOfAction?: string;
    commonSideEffects?: string;
    interactions?: string;
    labValueAlterations?: string;
    patientTeaching?: string;
    nursingAssessment?: string;
    holdAssessment?: string;
    evaluation?: string;
};

const infoFields: Array<{ key: keyof DrugCardFields; label: string; multiline?: boolean }> = [
    { key: 'tradeName', label: 'Trade Names' },
    { key: 'pronunciation', label: 'Pronunciation' },
    { key: 'therapeuticClass', label: 'Therapeutic / Pharmacologic Class' },
    { key: 'dose', label: 'Dose' },
    { key: 'routes', label: 'Route(s)' },
    { key: 'timeFrequency', label: 'Time / Frequency' },
    { key: 'normalDosageRange', label: 'Normal Dosage Range(s)' },
    { key: 'onset', label: 'Onset' },
    { key: 'peak', label: 'Peak' },
    { key: 'duration', label: 'Duration' },
    { key: 'commonSideEffects', label: 'Common Side Effects', multiline: true },
    { key: 'ivCompatibility', label: 'For IV medications, compatibility with IV drips and / or solutions', multiline: true },
    { key: 'whyPatientGettingMed', label: 'Why is your patient getting this medication?', multiline: true },
    { key: 'nursingImplications', label: 'Nursing Implications (what to focus on) Contraindications/warnings/interactions:', multiline: true },
    { key: 'mechanismOfAction', label: 'Mechanism of action and indications (Why med ordered - include pathophysiology)', multiline: true },
    { key: 'interactions', label: 'Interactions with other patient drugs, OTC or herbal medicines', multiline: true },
    { key: 'labValueAlterations', label: 'Lab value alterations caused by medicine', multiline: true },
    { key: 'patientTeaching', label: 'Be sure to teach the patient the following about this medication', multiline: true },
    { key: 'nursingAssessment', label: 'Nursing Process-Assessment (Pre-administration assessment, vital signs, lab values, etc.)', multiline: true },
    { key: 'holdAssessment', label: 'Assessment Why would you hold or not give this med?', multiline: true },
    { key: 'evaluation', label: 'Evaluation Check after giving med', multiline: true },
];

export default function ResourceDetails() {
    const router = useRouter();
    const { data, id } = useLocalSearchParams();

    const cardData = useMemo<DrugCardFields>(() => {
        if (!data || typeof data !== 'string') {
            return {};
        }

        try {
            return JSON.parse(decodeURIComponent(data)) as DrugCardFields;
        } catch {
            return {};
        }
    }, [data]);

    const title = cardData.genericName?.trim() || 'Drug Card';

    return (
        <View style={styles.screen}>
            <View style={styles.topRow}>
                <Ionicons name="checkmark-circle-outline" size={30} color="#4972FF" />
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name="arrow-back-outline" size={28} color="#000000" />
                </Pressable>
            </View>

            <AppText style={styles.title}>{title}</AppText>

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {infoFields.map(({ key, label, multiline }) => (
                    <View key={String(key)} style={styles.section}>
                        <AppText style={styles.label}>{label}</AppText>
                        <AppText style={[styles.value, multiline && styles.valueMultiline]}>
                            {cardData[key]?.trim() || '...'}
                        </AppText>
                    </View>
                ))}

                <View style={styles.buttonRow}>
                    <Pressable
                        style={styles.primaryButton}
                        onPress={() =>
                            router.push({
                                pathname: '/(student)/(tabs)/resourceFlow/addResource',
                                params: {
                                    id: typeof id === 'string' ? id : '',
                                    data: typeof data === 'string' ? data : '',
                                },
                            })
                        }
                    >
                        <AppText style={styles.primaryButtonText}>Edit Drug Card</AppText>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 35,
    },
    topRow: {
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    title: {
        fontSize: 35,
        lineHeight: 47,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
        paddingHorizontal: 36,
        marginBottom: 12,
    },
    scrollArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 36,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 18,
    },
    label: {
        fontSize: 20,
        lineHeight: 27,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    value: {
        fontSize: 20,
        lineHeight: 27,
        fontWeight: '400',
        color: '#000000',
    },
    valueMultiline: {
        minHeight: 54,
    },
    buttonRow: {
        marginTop: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    primaryButton: {
        width: 321,
        maxWidth: '100%',
        backgroundColor: '#4972FF',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
});