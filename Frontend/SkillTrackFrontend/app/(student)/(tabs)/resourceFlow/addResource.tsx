import { AddButton } from '@/components/ui/AddButton';
import {useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import generalStyles from '@/app/styles';
import { AppText } from "@/components/AppText";
import { fetchAuthSession } from 'aws-amplify/auth';
import {Alert} from 'react-native'
import { BASE_URL } from '@/src/constants/api';
import {
    ScrollView,
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
} from 'react-native';

type DrugCardFields = {
    genericName: string;
    tradeName: string;
    pronunciation: string;
    therapeuticClass: string;
    dose: string;
    routes: string;
    timeFrequency: string;
    normalDosageRange: string;
    onset: string;
    peak: string;
    duration: string;
    ivCompatibility: string;
    whyPatientGettingMed: string;
    nursingImplications: string;
    mechanismOfAction: string;
    commonSideEffects: string;
    interactions: string;
    labValueAlterations: string;
    patientTeaching: string;
    nursingAssessment: string;
    holdAssessment: string;
    evaluation: string;
};

const initialFields: DrugCardFields = {
    genericName: '',
    tradeName: '',
    pronunciation: '',
    therapeuticClass: '',
    dose: '',
    routes: '',
    timeFrequency: '',
    normalDosageRange: '',
    onset: '',
    peak: '',
    duration: '',
    ivCompatibility: '',
    whyPatientGettingMed: '',
    nursingImplications: '',
    mechanismOfAction: '',
    commonSideEffects: '',
    interactions: '',
    labValueAlterations: '',
    patientTeaching: '',
    nursingAssessment: '',
    holdAssessment: '',
    evaluation: '',
};

type FieldConfig = {
    key: keyof DrugCardFields;
    label: string;
    multiline?: boolean;
};

const fields: FieldConfig[] = [
    { key: 'genericName', label: 'Generic Name' },
    { key: 'tradeName', label: 'Trade Name' },
    { key: 'pronunciation', label: 'Pronunciation' },
    { key: 'therapeuticClass', label: 'Therapeutic Class / Pharmacologic Class' },
    { key: 'dose', label: 'Dose' },
    { key: 'routes', label: 'Route(s)' },
    { key: 'timeFrequency', label: 'Time / Frequency' },
    { key: 'normalDosageRange', label: 'Normal Dosage Range(s)' },
    { key: 'onset', label: 'Onset' },
    { key: 'peak', label: 'Peak' },
    { key: 'duration', label: 'Duration' },
    { key: 'ivCompatibility', label: 'IV Compatibility (drips and/or solutions)' },
    { key: 'whyPatientGettingMed', label: 'Why is your patient getting this medication?' },
    { key: 'nursingImplications', label: 'Nursing Implications / Contraindications / Warnings / Interactions', multiline: true },
    { key: 'mechanismOfAction', label: 'Mechanism of Action and Indications (include pathophysiology)', multiline: true },
    { key: 'commonSideEffects', label: 'Common Side Effects', multiline: true },
    { key: 'interactions', label: 'Interactions with other patient drugs, OTC or herbal medicines', multiline: true },
    { key: 'labValueAlterations', label: 'Lab Value Alterations Caused by Medicine', multiline: true },
    { key: 'patientTeaching', label: 'Patient Teaching', multiline: true },
    { key: 'nursingAssessment', label: 'Nursing Process – Assessment (pre-administration, vital signs, lab values, etc.)', multiline: true },
    { key: 'holdAssessment', label: 'Why would you hold or not give this med?', multiline: true },
    { key: 'evaluation', label: 'Evaluation (check after giving med)', multiline: true },
];



export default function AddResource() {
    const [form, setForm] = useState<DrugCardFields>(initialFields);
    const router = useRouter();
    
    const {data} = useLocalSearchParams();
    const {id} = useLocalSearchParams();

    const[cardID, setCardID] = useState(0)


    //

    useEffect(() => {
        async function loadExistingCardIfPresent(){
            console.log('eee')

            if(!data){
                console.log("nope")
                setForm(initialFields)


            }else{
                console.log("yup")
                const parsedData = JSON.parse(decodeURIComponent(data as string))

                console.log(parsedData)
                console.log(id)
                setForm(parsedData)
                if (typeof id === "string") {
                    setCardID(parseInt(id))
                }
            }

            

            //console.log(parsedData)

   
        }
        loadExistingCardIfPresent()  

    }, [data])

    async function handleAddDrugCard(){

        try{
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            if (!token) {
                throw new Error('No authentication token found');
            }



            let body = 
            JSON.stringify({
            ...form,            //This notation automatically maps the form var onto the endpoint body! Note that as such the DrugCardFields MUST match the endpoint format. Please do not modify it unless you coordinate with backend endpoint changes
            CardID: cardID ,})

            if(cardID === 0){
                let body = 
                JSON.stringify({
                ...form,            //This notation automatically maps the form var onto the endpoint body! Note that as such the DrugCardFields MUST match the endpoint format. Please do not modify it unless you coordinate with backend endpoint changes
                })
            }

            const res = await fetch(`${BASE_URL}/AddDrugCardToUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: body,
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            Alert.alert('Success', 'Drug Card Made!');
            router.back();

        }
        catch (err:any){
            console.error('Error creating Drug Card:', err);
            Alert.alert('Error', err.message || 'Failed to create drug card');

        }
        
    }

    const handleChange = (key: keyof DrugCardFields, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Drug Card</Text>

                {fields.map(({ key, label, multiline }) => (
                    <View key={key} style={styles.fieldContainer}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            style={[styles.input, multiline && styles.inputMultiline]}
                            value={form[key]}
                            onChangeText={value => handleChange(key, value)}
                            multiline={multiline}
                            numberOfLines={multiline ? 3 : 1}
                        />
                    </View>
                ))}
                
                <Pressable style= {generalStyles.generalButton} onPress={async () =>{ await handleAddDrugCard() ;router.push('/resourceFlow/resources');  }} >
                    <AppText style ={generalStyles.generalButtonText} >
                        Create/Update Drug Card
                    </AppText>
                </Pressable>

                <Pressable style= {generalStyles.generalButton} onPress={() => router.push('/resourceFlow/resources')}>
                    <AppText style ={generalStyles.generalButtonText} >
                        Cancel
                    </AppText>
                </Pressable>
                
                <View style = {styles.spacer}/>



            </ScrollView>
            <View style={styles.addButtonContainer}>
                <AddButton onPress={() => router.push('/resourceFlow/resources')} />
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontWeight: '600',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
    },
    inputMultiline: {
        minHeight: 72,
        textAlignVertical: 'top',
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: 150,
        paddingHorizontal: 24,
        paddingVertical: 16
    },
    spacer: {
        height: 100,
    }
});