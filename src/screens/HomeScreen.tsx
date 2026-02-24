import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { getBoxes } from '../services/boxService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function HomeScreen({ navigation }: any) {
    const [printing, setPrinting] = React.useState(false);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const handlePrintAllQRs = async () => {
        try {
            setPrinting(true);
            const boxes = await getBoxes();

            if (!boxes || boxes.length === 0) {
                Alert.alert('Aviso', 'No tienes ninguna caja creada para imprimir.');
                return;
            }

            // Create HTML grid of QRs
            let htmlContent = `
                <html>
                <head>
                    <style>
                        @media print {
                            @page { size: A4; margin: 0; }
                            body { margin: 1cm; }
                        }
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
                        h1 { text-align: center; color: #333; margin-bottom: 30px; }
                        .grid { display: flex; flex-wrap: wrap; justify-content: flex-start; }
                        .qr-item { width: 28%; margin: 15px 2%; text-align: center; page-break-inside: avoid; border: 1px dashed #ccc; padding: 15px; border-radius: 8px;}
                        .qr-name { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; }
                        .qr-image { width: 140px; height: 140px; }
                    </style>
                </head>
                <body>
                    <h1>Códigos QR de Mis Cajas</h1>
                    <div class="grid">
            `;

            for (const box of boxes) {
                // Ensure the box has a qr_code payload to print. If it doesn't, skip or generate.
                // We will use an external QR generator API for the HTML rendering since react-native-qrcode-svg doesn't stringify to HTML easily.
                const qrData = box.qr_code || JSON.stringify({ type: 'box', id: box.id });
                const encodedData = encodeURIComponent(qrData);
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;

                htmlContent += `
                    <div class="qr-item">
                        <div class="qr-name">${box.name}</div>
                        <img class="qr-image" src="${qrUrl}" />
                    </div>
                `;
            }

            htmlContent += `
                    </div>
                </body>
                </html>
            `;

            if (Platform.OS === 'web') {
                // En Web, abrir una ventana nueva es la forma más segura de que solo se imprima el HTML generado
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    // Esperar a que carguen las imágenes de los QRs (API externa)
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                } else {
                    Alert.alert('Error', 'No se pudo abrir la ventana de impresión. Por favor, permite las ventanas emergentes.');
                }
            } else {
                // En móviles, generamos el PDF y usamos el diálogo nativo
                const { uri } = await Print.printToFileAsync({ html: htmlContent });
                if (Platform.OS === 'ios') {
                    await Sharing.shareAsync(uri);
                } else {
                    await Print.printAsync({ uri });
                }
            }

        } catch (error: any) {
            Alert.alert('Error al imprimir', error.message);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>¿Qué quieres hacer?</Text>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Boxes')}
            >
                <Text style={styles.cardEmoji}>📦</Text>
                <Text style={styles.cardTitle}>Mis Cajas</Text>
                <Text style={styles.cardDesc}>Gestiona tus cajas y ubicaciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Clothes')}
            >
                <Text style={styles.cardEmoji}>👖</Text>
                <Text style={styles.cardTitle}>Mis Prendas</Text>
                <Text style={styles.cardDesc}>Añade y busca prendas individuales</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.card, styles.scannerCard]}
                onPress={() => navigation.navigate('Scanner')}
            >
                <Text style={styles.cardEmoji}>📷</Text>
                <Text style={styles.cardTitle}>Escanear QR</Text>
                <Text style={styles.cardDesc}>Ver el contenido de una caja al instante</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.card, styles.printCard]}
                onPress={handlePrintAllQRs}
                disabled={printing}
            >
                <Text style={styles.cardEmoji}>🖨️</Text>
                <Text style={styles.cardTitle}>Imprimir todos los QR</Text>
                <Text style={styles.cardDesc}>Genera un DinA4 con los QRs de tus cajas</Text>
                {printing && <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 10 }} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    scannerCard: {
        backgroundColor: '#e6f2ff',
        borderColor: '#007AFF',
        borderWidth: 1,
    },
    printCard: {
        backgroundColor: '#f0fdf4',
        borderColor: '#34C759',
        borderWidth: 1,
    },
    cardEmoji: { fontSize: 32, marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { fontSize: 14, color: '#666' },
    signOutButton: {
        marginTop: 'auto',
        padding: 15,
        alignItems: 'center',
    },
    signOutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    }
});
