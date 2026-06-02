import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, View, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { fetchAuthSession } from 'aws-amplify/auth';
import { BASE_URL } from '../../../src/constants/api';

// calls /TokenToEmail with the scanned QR token and returns the student's plain email
// needed for calling studentDetails page!
async function resolveTokenToEmail(scannedToken: string): Promise<string> {
    const session = await fetchAuthSession();
    const authToken = session.tokens?.idToken?.toString();
    if (!authToken) throw new Error('No authentication token found');

    // call API using required scannedToken parameter
    const response = await fetch(`${BASE_URL}/TokenToEmail?Token=${encodeURIComponent(scannedToken)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
        },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();

    if (!result?.ID) throw new Error('No email was returned');
    return result.ID;
}

export default function CameraTab() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    // this is called when a bar code is detected
    // the token is resolved into the email
    // and passed in for the studentDetail page
    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        // Prevent multiple scans firing simultaneously
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const email = await resolveTokenToEmail(data);
            router.push({ pathname: '/(instructor)/(tabs)/qr/studentDetails', params: { email } });
        } catch (error) {
            console.error('Error resolving token:', error);
            Alert.alert('Error', 'Failed to look up student. Please try again.', [
                { text: 'OK', onPress: () => setIsProcessing(false) },
            ]);
        } finally {
            // this is so the text properly displays "loading" vs "point camera..."
            setIsProcessing(false);
        }
    };

    if (!permission) return <View />;

    // request permission for camera use
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to use the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                // only scans QR codes, no bar codes or anything
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}

                // we want to call the handleBarcodeScanned when it's done processing
                // otherwise it can reload the studentDetail page multiple times
                onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
            />

            {/* Overlay with scanning frame and status hint */}
            <View style={styles.overlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.scanHint}>
                    {isProcessing ? 'Looking up student...' : `Point camera at student's QR code`}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 220,
        height: 220,
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    scanHint: {
        marginTop: 20,
        color: 'white',
        fontSize: 14,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
});