import React, { useState } from 'react';
import { Text, View, StyleSheet, Button, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScannerScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);
        try {
            const payload = JSON.parse(data);
            if (payload.type === 'box' && payload.id) {
                if (Platform.OS === 'web') {
                    // On web, Alert behavior is slightly different, fallback to standard window.confirm if needed
                    const confirmView = window.confirm('Caja Encontrada. ¿Quieres ver el contenido?');
                    if (confirmView) {
                        setScanned(false);
                        navigation.navigate('BoxDetail', { boxId: payload.id });
                    } else {
                        setScanned(false);
                    }
                } else {
                    Alert.alert(
                        'Caja Encontrada',
                        '¿Quieres ver el contenido?',
                        [
                            { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
                            {
                                text: 'Ver',
                                onPress: () => {
                                    setScanned(false);
                                    navigation.navigate('BoxDetail', { boxId: payload.id });
                                }
                            }
                        ]
                    );
                }
            } else {
                throw new Error('Formato no válido');
            }
        } catch (e) {
            if (Platform.OS === 'web') {
                window.alert('Código QR no válido. Este código no pertenece a ninguna caja de Organizador.');
                setScanned(false);
            } else {
                Alert.alert('Código QR no válido', 'Este código no pertenece a ninguna caja de Organizador.', [
                    { text: 'OK', onPress: () => setScanned(false) }
                ]);
            }
        }
    };

    if (!permission) {
        return (
            <View style={styles.center}>
                <Text>Solicitando permiso de cámara...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.permissionText}>No hay acceso a la cámara. Por favor autoriza la aplicación.</Text>
                <Button onPress={requestPermission} title="Conceder Permiso" />
            </View>
        );
    }

    // Expo Camera has basic experimental web support, but relies on browser APIs
    if (Platform.OS === 'web') {
        return (
            <View style={styles.center}>
                <Text style={styles.permissionText}>
                    ⚠️ La vista de cámara web puede ser experimental en Expo SDK 54. Asegúrate de otorgar permisos al navegador.
                </Text>
                <View style={styles.webCameraContainer}>
                    <CameraView
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />
                </View>
                {scanned && <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.overlay}>
                <View style={styles.topOverlay} />
                <View style={styles.middleRow}>
                    <View style={styles.sideOverlay} />
                    <View style={styles.focusArea} />
                    <View style={styles.sideOverlay} />
                </View>
                <View style={styles.bottomOverlay}>
                    {scanned && <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    permissionText: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
    container: { flex: 1, flexDirection: 'column', backgroundColor: 'black' },
    webCameraContainer: { width: 300, height: 300, overflow: 'hidden', borderRadius: 10, marginVertical: 20 },
    overlay: { flex: 1 },
    topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    middleRow: { flexDirection: 'row', height: 250 },
    sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    focusArea: { width: 250, backgroundColor: 'transparent', borderColor: '#fff', borderWidth: 2 },
});
