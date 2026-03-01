import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getOutfits, deleteOutfit } from '../services/outfitService';

export default function OutfitsScreen({ navigation }: any) {
    const [outfits, setOutfits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const loadOutfits = async () => {
        try {
            setLoading(true);
            const data = await getOutfits();
            setOutfits(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadOutfits();
        }
    }, [isFocused]);

    const handleDeleteOutfit = (id: string) => {
        Alert.alert('Eliminar Outfit', '¿Seguro?', [
            { text: 'No' },
            {
                text: 'Sí',
                style: 'destructive',
                onPress: async () => {
                    await deleteOutfit(id);
                    loadOutfits();
                }
            }
        ]);
    };

    if (loading && outfits.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF9500" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={outfits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.outfitCard}
                        onPress={() => navigation.navigate('OutfitEdit', { existingOutfit: item })}
                    >
                        <View style={styles.outfitInfo}>
                            <Text style={styles.outfitName}>{item.name}</Text>
                            {item.description && <Text style={styles.outfitDesc}>{item.description}</Text>}
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteOutfit(item.id)}>
                            <Text style={styles.deleteIcon}>🗑</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No tienes outfits. Genera uno con IA.</Text>}
                contentContainerStyle={styles.listContainer}
            />

            <TouchableOpacity
                style={styles.generateButton}
                onPress={() => navigation.navigate('OutfitEdit')}
            >
                <Text style={styles.generateButtonText}>✨ Sugerir / Crear Outfit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 16, paddingBottom: 100 },
    outfitCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    outfitInfo: { flex: 1 },
    outfitName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    outfitDesc: { fontSize: 14, color: '#666', marginTop: 4 },
    deleteIcon: { fontSize: 22, color: '#FF3B30' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' },
    generateButton: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        backgroundColor: '#FF9500',
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    generateButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
