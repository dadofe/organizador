import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput, Image, FlatList } from 'react-native';
import { getClothes } from '../services/clothesService';
import { createOutfit, getOutfitById } from '../services/outfitService';

export default function OutfitEditScreen({ route, navigation }: any) {
    const existingOutfitId = route.params?.existingOutfit?.id;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [allClothes, setAllClothes] = useState<any[]>([]);
    const [selectedClothes, setSelectedClothes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const clothesData = await getClothes();
            setAllClothes(clothesData || []);

            if (existingOutfitId) {
                const outfit = await getOutfitById(existingOutfitId);
                setName(outfit.name);
                setDescription(outfit.description || '');
                setSelectedClothes(outfit.clothes || []);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAISuggestion = () => {
        if (allClothes.length === 0) {
            Alert.alert('Aviso', 'Primero añade algunas prendas a tu inventario.');
            return;
        }

        setSuggesting(true);

        // Simulación de análisis de "fotos" (usando los datos de las prendas)
        // Agrupamos por tipos lógicos
        const tops = allClothes.filter(c => ['Camisa', 'Camiseta', 'Top', 'Jersey', 'Suéter'].includes(c.type));
        const bottoms = allClothes.filter(c => ['Pantalón'].includes(c.type));
        const jackets = allClothes.filter(c => ['Chaqueta'].includes(c.type));

        setTimeout(() => {
            let suggestion: any[] = [];

            if (tops.length > 0) suggestion.push(tops[Math.floor(Math.random() * tops.length)]);
            if (bottoms.length > 0) suggestion.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
            if (jackets.length > 0 && Math.random() > 0.5) suggestion.push(jackets[Math.floor(Math.random() * jackets.length)]);

            if (suggestion.length === 0) {
                Alert.alert('IA', 'No he podido combinar nada con tus prendas actuales. ¡Añade más!');
            } else {
                setSelectedClothes(suggestion);
                setName(`Outfit sugerido ${new Date().toLocaleDateString()}`);
            }
            setSuggesting(false);
        }, 800);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Ponle un nombre al outfit');
            return;
        }
        if (selectedClothes.length === 0) {
            Alert.alert('Error', 'Selecciona al menos una prenda');
            return;
        }

        try {
            setLoading(true);
            const clothesIds = selectedClothes.map(c => c.id);
            await createOutfit({ name, description }, clothesIds);
            Alert.alert('¡Listo!', 'Outfit guardado correctamente');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeSelectedCloth = (id: string) => {
        setSelectedClothes(selectedClothes.filter(c => c.id !== id));
    };

    if (loading && !suggesting && allClothes.length === 0) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#FF9500" /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Nombre del Outfit</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej. Look de Verano"
                />

                <Text style={styles.label}>Descripción (Opcional)</Text>
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ej. Ideal para ir a cenar"
                />
            </View>

            <TouchableOpacity
                style={styles.aiButton}
                onPress={handleAISuggestion}
                disabled={suggesting}
            >
                {suggesting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.aiButtonText}>✨ Analizar fotos y sugerir Outfit</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Prendas en este outfit ({selectedClothes.length})</Text>

            <View style={styles.selectedContainer}>
                {selectedClothes.map(cloth => (
                    <View key={cloth.id} style={styles.clothTag}>
                        <Image
                            source={cloth.image_url ? { uri: cloth.image_url } : { uri: 'https://via.placeholder.com/50' }}
                            style={styles.clothSmallImage}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.clothTagName} numberOfLines={1}>{cloth.name}</Text>
                            <Text style={styles.clothTagType}>{cloth.type}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeSelectedCloth(cloth.id)}>
                            <Text style={styles.removeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>Guardar Outfit</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    aiButton: {
        backgroundColor: '#5856D6',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#5856D6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    aiButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    selectedContainer: { marginBottom: 20 },
    clothTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    clothSmallImage: { width: 40, height: 40, borderRadius: 20 },
    clothTagName: { fontSize: 15, fontWeight: '600' },
    clothTagType: { fontSize: 13, color: '#999' },
    removeIcon: { fontSize: 20, color: '#FF3B30', paddingHorizontal: 10 },
    saveButton: {
        backgroundColor: '#FF9500',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
