import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getBoxById, updateBoxQRCode, deleteBox } from '../services/boxService';
import { getClothesByBox } from '../services/clothesService';
import ClothCard from '../components/ClothCard';
import QRGenerator from '../components/QRGenerator';
import { useIsFocused } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function BoxDetailScreen({ route, navigation }: any) {
    const { boxId } = route.params;
    const isFocused = useIsFocused();
    const [box, setBox] = useState<any>(null);
    const [clothes, setClothes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const viewShotRef = React.useRef<any>(null);

    const loadBoxData = async () => {
        try {
            setLoading(true);
            const boxData = await getBoxById(boxId);

            // Auto-generate QR if it doesn't have one
            if (!boxData.qr_code) {
                const qrPayload = JSON.stringify({ type: 'box', id: boxData.id });
                await updateBoxQRCode(boxData.id, qrPayload);
                boxData.qr_code = qrPayload;
            }

            setBox(boxData);

            const clothesData = await getClothesByBox(boxId);
            setClothes(clothesData || []);
        } catch (error: any) {
            Alert.alert('Error cargando caja', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadBoxData();
        }
    }, [boxId, isFocused]);

    const captureAndShareQR = async () => {
        try {
            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                const isAvailable = await Sharing.isAvailableAsync();

                if (isAvailable) {
                    await Sharing.shareAsync(uri, {
                        mimeType: 'image/png',
                        dialogTitle: `QR de la caja: ${box?.name}`
                    });
                } else {
                    Alert.alert('Aviso', 'Compartir no está disponible en este dispositivo. La imagen se guardó temporalmente en: ' + uri);
                }
            }
        } catch (error: any) {
            Alert.alert('Error capturando QR', error.message);
        }
    };

    const handleDeleteBox = () => {
        Alert.alert('Eliminar Caja', '¿Estás seguro de que quieres eliminar esta caja? Todas las prendas que contenga perderán su asignación.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        console.log('Iniciando eliminación de caja:', box.id);
                        setLoading(true);
                        const result = await deleteBox(box.id);
                        console.log('Resultado de eliminación:', result);
                        navigation.goBack();
                    } catch (error: any) {
                        console.error('Error al eliminar caja:', error);
                        Alert.alert(
                            'Error al eliminar',
                            `No se pudo eliminar: ${error.message || 'Error desconocido'}\n\nDetalles: ${JSON.stringify(error)}`
                        );
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    if (loading || !box) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>{box.name}</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={captureAndShareQR}>
                            <Text style={styles.iconButton}>🖨️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('BoxEdit', { existingBox: box })}>
                            <Text style={styles.iconButton}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteBox} style={styles.actionIconButton}>
                            <Text style={styles.iconButton}>🗑</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {box.description && <Text style={styles.desc}>{box.description}</Text>}
                {box.location && <Text style={styles.location}>📍 {box.location}</Text>}
            </View>

            <View style={styles.qrPrintContainerHidden}>
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                    <View style={styles.qrPrintContent}>
                        <Text style={styles.qrPrintTitle}>{box.name}</Text>
                        <QRGenerator value={box.qr_code} size={150} />
                    </View>
                </ViewShot>
            </View>

            <Text style={styles.sectionTitle}>Prendas en esta caja ({clothes.length})</Text>

            <FlatList
                data={clothes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ClothCard
                        id={item.id}
                        name={item.name}
                        type={item.type}
                        brand={item.brand}
                        size={item.size}
                        imageUrl={item.image_url}
                        onPress={() => navigation.navigate('ClothDetail', { clothId: item.id, boxId: box.id })}
                    />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Caja vacía.</Text>}
                contentContainerStyle={styles.listContainer}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Clothes', { selectingForBox: box.id })}
            >
                <Text style={styles.addButtonText}>Añadir / Ver Prendas</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerActions: { flexDirection: 'row', gap: 15 },
    iconButton: { fontSize: 22 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, flex: 1 },
    desc: { fontSize: 16, color: '#666', marginBottom: 5 },
    location: { fontSize: 14, color: '#333' },
    actionIconButton: { padding: 10, marginHorizontal: -5 },
    qrPrintContainerHidden: {
        position: 'absolute',
        top: -1000,
        left: -1000,
        opacity: 0,
    },
    qrPrintContent: { backgroundColor: '#fff', padding: 20, alignItems: 'center' },
    qrPrintTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginTop: 20, marginBottom: 10 },
    listContainer: { paddingBottom: 100 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
    addButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
