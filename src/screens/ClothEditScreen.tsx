import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { createCloth, updateCloth } from '../services/clothesService';

export default function ClothEditScreen({ route, navigation }: any) {
    const existingCloth = route.params?.existingCloth;

    const [name, setName] = useState(existingCloth?.name || '');
    const [type, setType] = useState(existingCloth?.type || '');
    const [brand, setBrand] = useState(existingCloth?.brand || '');
    const [color, setColor] = useState(existingCloth?.color || '');
    const [size, setSize] = useState(existingCloth?.size || '');
    const [season, setSeason] = useState(existingCloth?.season || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre de la prenda es obligatorio');
            return;
        }

        try {
            setLoading(true);
            const payload = { name, type, brand, color, size, season };

            if (existingCloth) {
                await updateCloth(existingCloth.id, payload);
                Alert.alert('Prenda actualizada', 'Los cambios se guardaron con éxito');
            } else {
                await createCloth(payload);
                Alert.alert('Prenda creada', 'La prenda se guardó con éxito');
            }
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} placeholder="Ej. Camiseta Star Wars" value={name} onChangeText={setName} />

            <Text style={styles.label}>Tipo de prenda</Text>
            <TextInput style={styles.input} placeholder="Ej. Camiseta, Pantalón..." value={type} onChangeText={setType} />

            <Text style={styles.label}>Marca</Text>
            <TextInput style={styles.input} placeholder="Ej. Zara, Nike..." value={brand} onChangeText={setBrand} />

            <Text style={styles.label}>Color</Text>
            <TextInput style={styles.input} placeholder="Ej. Negro, Azul..." value={color} onChangeText={setColor} />

            <Text style={styles.label}>Talla</Text>
            <TextInput style={styles.input} placeholder="Ej. M, L, 42..." value={size} onChangeText={setSize} />

            <Text style={styles.label}>Temporada</Text>
            <TextInput style={styles.input} placeholder="Ej. Verano, Invierno..." value={season} onChangeText={setSeason} />

            {loading ? (
                <ActivityIndicator size="large" color="#FF9500" style={styles.loader} />
            ) : (
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar Prenda</Text>
                </TouchableOpacity>
            )}
            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fcfcfc' },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    loader: { marginVertical: 20 },
    saveButton: {
        backgroundColor: '#FF9500',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
