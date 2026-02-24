import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { createBox, updateBox } from '../services/boxService';

export default function BoxEditScreen({ route, navigation }: any) {
    const existingBox = route.params?.existingBox;

    const [name, setName] = useState(existingBox?.name || '');
    const [description, setDescription] = useState(existingBox?.description || '');
    const [location, setLocation] = useState(existingBox?.location || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre de la caja es obligatorio');
            return;
        }

        try {
            setLoading(true);
            const payload = { name, description, location };

            if (existingBox) {
                await updateBox(existingBox.id, payload);
                Alert.alert('Caja actualizada', 'Los cambios se guardaron con éxito');
            } else {
                await createBox(payload);
                Alert.alert('Caja creada', 'La caja se creó con éxito');
            }
            // Pop the current screen and return previous
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error al crear caja', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nombre de la Caja *</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej. Ropa de Invierno"
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ej. Abrigos, bufandas, guantes..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
            />

            <Text style={styles.label}>Ubicación</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej. Altillo del dormitorio"
                value={location}
                onChangeText={setLocation}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
            ) : (
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fcfcfc' },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
