import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { getBoxes } from '../services/boxService';
import { getClothes } from '../services/clothesService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useIsFocused } from '@react-navigation/native';

export default function HomeScreen({ navigation }: any) {
    const [printing, setPrinting] = useState(false);
    const [stats, setStats] = useState({ boxes: 0, clothes: 0 });
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const loadStats = async () => {
        try {
            const [boxes, clothes] = await Promise.all([getBoxes(), getClothes()]);
            setStats({
                boxes: boxes?.length || 0,
                clothes: clothes?.length || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadStats();
        }
    }, [isFocused]);

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

            let htmlContent = `
                <html>
                <head>
                    <style>
                        @media print { @page { size: A4; margin: 0; } body { margin: 1cm; } }
                        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; }
                        h1 { text-align: center; color: #333; margin-bottom: 30px; }
                        .grid { display: flex; flex-wrap: wrap; }
                        .qr-item { width: 28%; margin: 15px 2%; text-align: center; page-break-inside: avoid; border: 1px dashed #ccc; padding: 15px; border-radius: 8px;}
                        .qr-name { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
                        .qr-image { width: 140px; height: 140px; }
                    </style>
                </head>
                <body>
                    <h1>Mis Cajas - Códigos QR</h1>
                    <div class="grid">
            `;

            for (const box of boxes) {
                const qrData = box.qr_code || JSON.stringify({ type: 'box', id: box.id });
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
                htmlContent += `
                    <div class="qr-item">
                        <div class="qr-name">${box.name}</div>
                        <img class="qr-image" src="${qrUrl}" />
                    </div>
                `;
            }

            htmlContent += `</div></body></html>`;

            if (Platform.OS === 'web') {
                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute'; iframe.style.top = '-1000px';
                document.body.appendChild(iframe);
                const doc = iframe.contentWindow?.document;
                if (doc) {
                    doc.open(); doc.write(htmlContent); doc.close();
                    setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }, 1000);
                }
            } else {
                const { uri } = await Print.printToFileAsync({ html: htmlContent });
                if (Platform.OS === 'ios') await Sharing.shareAsync(uri);
                else await Print.printAsync({ uri });
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>¡Hola de nuevo! 👋</Text>
                <Text style={styles.mainTitle}>Organizador de la Mona</Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>📦</Text>
                    <Text style={styles.statNumber}>{stats.boxes}</Text>
                    <Text style={styles.statLabel}>Cajas</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FFF5E6' }]}>
                    <Text style={styles.statEmoji}>👕</Text>
                    <Text style={styles.statNumber}>{stats.clothes}</Text>
                    <Text style={styles.statLabel}>Prendas</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.actionCard, { borderLeftColor: '#007AFF' }]}
                    onPress={() => navigation.navigate('Scanner')}
                >
                    <Text style={styles.actionEmoji}>📷</Text>
                    <View>
                        <Text style={styles.actionTitle}>Escanear Caja</Text>
                        <Text style={styles.actionDesc}>Mira qué hay dentro</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { borderLeftColor: '#8B5CF6' }]}
                    onPress={() => navigation.navigate('Outfits')}
                >
                    <Text style={styles.actionEmoji}>✨</Text>
                    <View>
                        <Text style={styles.actionTitle}>Generar Outfit</Text>
                        <Text style={styles.actionDesc}>Sugerencias con IA</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { borderLeftColor: '#34C759' }]}
                    onPress={handlePrintAllQRs}
                    disabled={printing}
                >
                    <Text style={styles.actionEmoji}>🖨️</Text>
                    <View>
                        <Text style={styles.actionTitle}>Imprimir QRs</Text>
                        <Text style={styles.actionDesc}>Prepara tus etiquetas</Text>
                    </View>
                    {printing && <ActivityIndicator size="small" color="#34C759" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    header: { padding: 24, paddingTop: 40, backgroundColor: '#fff' },
    welcome: { fontSize: 16, color: '#666', fontWeight: '500' },
    mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#FF9500', marginTop: 4 },
    statsRow: { flexDirection: 'row', padding: 16, gap: 16 },
    statCard: {
        flex: 1,
        backgroundColor: '#E6F2FF',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    statEmoji: { fontSize: 24, marginBottom: 8 },
    statNumber: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 24, marginTop: 10, marginBottom: 16, color: '#333' },
    quickActions: { paddingHorizontal: 20, gap: 12 },
    actionCard: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    },
    actionEmoji: { fontSize: 28, marginRight: 16 },
    actionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    actionDesc: { fontSize: 13, color: '#999' },
    signOutButton: { marginTop: 40, padding: 20, alignItems: 'center' },
    signOutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' }
});
