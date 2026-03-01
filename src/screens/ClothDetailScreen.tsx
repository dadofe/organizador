import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
import { getClothById, addClothToBox, removeClothFromBox, deleteCloth, getBoxByClothId } from '../services/clothesService';
import { getBoxes } from '../services/boxService';
import { useIsFocused } from '@react-navigation/native';

export default function ClothDetailScreen({ route, navigation }: any) {
    const { clothId, boxId: initialBoxId } = route.params || {};
    const isFocused = useIsFocused();

    const [cloth, setCloth] = useState<any>(null);
    const [boxes, setBoxes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignedBoxId, setAssignedBoxId] = useState<string | null>(initialBoxId || null);

    useEffect(() => {
        if (isFocused && clothId) {
            loadData();
        }
    }, [clothId, isFocused]);

    const loadData = async () => {
        try {
            setLoading(true);
            const clothData = await getClothById(clothId);
            setCloth(clothData);

            // If we don't have boxId from route params, fetch it from database
            if (!initialBoxId) {
                const boxId = await getBoxByClothId(clothId);
                setAssignedBoxId(boxId);
            }

            const availableBoxes = await getBoxes();
            setBoxes(availableBoxes || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const assignToBox = async (selectedBoxId: string) => {
        try {
            if (assignedBoxId) {
                await removeClothFromBox(assignedBoxId, cloth.id);
            }
            await addClothToBox(selectedBoxId, cloth.id);
            setAssignedBoxId(selectedBoxId);
            Alert.alert('Éxito', 'Prenda asignada a la caja.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = () => {
        Alert.alert('Eliminar Prenda', '¿Seguro que quieres borrar esta prenda permanentemente?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        console.log('Iniciando eliminación de prenda:', cloth.id);
                        setLoading(true);
                        const result = await deleteCloth(cloth.id);
                        console.log('Resultado de eliminación:', result);
                        navigation.goBack();
                    } catch (error: any) {
                        console.error('Error al eliminar prenda:', error);
                        Alert.alert('Error al eliminar', error.message || 'Error desconocido');
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    if (loading || !cloth) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.imagePlaceholder}>
                    {cloth.image_url ? (
                        <Image source={{ uri: cloth.image_url }} style={styles.clothImage} />
                    ) : (
                        <Text style={styles.emoji}>👕</Text>
                    )}
                </View>
                <Text style={styles.title}>{cloth.name}</Text>
                <Text style={styles.detail}>Tipo: {cloth.type || 'N/A'}</Text>
                <Text style={styles.detail}>Marca: {cloth.brand || 'N/A'}</Text>
                <Text style={styles.detail}>Color: {cloth.color || 'N/A'}</Text>
                <Text style={styles.detail}>Talla: {cloth.size || 'N/A'}</Text>
                <Text style={styles.detail}>Temporada: {cloth.season || 'N/A'}</Text>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('ClothEdit', { existingCloth: cloth })}
                    >
                        <Text style={styles.actionText}>✏️ Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.actionTextWhite}>🗑 Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Asignar a Caja</Text>
                {boxes.length === 0 ? (
                    <Text style={styles.emptyText}>No tienes cajas creadas.</Text>
                ) : (
                    boxes.map((b) => (
                        <TouchableOpacity
                            key={b.id}
                            style={[styles.boxOption, assignedBoxId === b.id && styles.boxOptionSelected]}
                            onPress={() => assignToBox(b.id)}
                        >
                            <Text style={[styles.boxOptionText, assignedBoxId === b.id && styles.boxOptionTextSelected]}>
                                {b.name}
                            </Text>
                            {assignedBoxId === b.id && <Text style={styles.checkIcon}>✅</Text>}
                        </TouchableOpacity>
                    ))
                )}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        margin: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden', // Ensure image respects borderRadius
    },
    clothImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    emoji: { fontSize: 50 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    detail: { fontSize: 16, color: '#444', marginBottom: 5, alignSelf: 'flex-start', marginLeft: 20 },
    section: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    boxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    boxOptionSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#e6f2ff',
    },
    boxOptionText: { fontSize: 16, color: '#333' },
    boxOptionTextSelected: { fontWeight: 'bold', color: '#007AFF' },
    checkIcon: { fontSize: 16 },
    emptyText: { color: '#666', fontStyle: 'italic' },
    actionsRow: { flexDirection: 'row', marginTop: 20, width: '100%', justifyContent: 'space-around' },
    editButton: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, width: '45%', alignItems: 'center' },
    deleteButton: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 8, width: '45%', alignItems: 'center' },
    actionText: { color: '#333', fontWeight: 'bold' },
    actionTextWhite: { color: '#fff', fontWeight: 'bold' }
});
