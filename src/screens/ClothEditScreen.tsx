import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { createCloth, updateCloth, uploadClothImage } from '../services/clothesService';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const CLOTH_TYPES = [
    'Camisa', 'Pantalón', 'Camiseta', 'Chaqueta', 'Jersey', 'Suéter', 'Top', 'Bañador', 'Toalla'
];

export default function ClothEditScreen({ route, navigation }: any) {
    const existingCloth = route.params?.existingCloth;

    const [name, setName] = useState(existingCloth?.name || '');
    const [type, setType] = useState(existingCloth?.type || '');
    const [brand, setBrand] = useState(existingCloth?.brand || '');
    const [color, setColor] = useState(existingCloth?.color || '');
    const [size, setSize] = useState(existingCloth?.size || '');
    const [season, setSeason] = useState(existingCloth?.season || '');
    const [imageUrl, setImageUrl] = useState(existingCloth?.image_url || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para hacer fotos.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            try {
                setUploading(true);
                const publicUrl = await uploadClothImage(result.assets[0].uri);
                setImageUrl(publicUrl);
            } catch (error: any) {
                Alert.alert('Error subiendo imagen', error.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre de la prenda es obligatorio');
            return;
        }

        try {
            setLoading(true);
            const payload = { name, type, brand, color, size, season, image_url: imageUrl };

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
            <View style={styles.imageSection}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.photoButton} onPress={pickImage} disabled={uploading}>
                    {uploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.photoButtonText}>📸 Hacer Foto</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} placeholder="Ej. Camiseta Star Wars" value={name} onChangeText={setName} />

            <Text style={styles.label}>Tipo de prenda</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={type}
                    onValueChange={(itemValue) => setType(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Selecciona un tipo..." value="" />
                    {CLOTH_TYPES.map((t) => (
                        <Picker.Item key={t} label={t} value={t} />
                    ))}
                </Picker>
            </View>

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
    imageSection: { alignItems: 'center', marginBottom: 20 },
    previewImage: { width: 150, height: 150, borderRadius: 12, backgroundColor: '#f0f0f0' },
    imagePlaceholder: { width: 150, height: 150, borderRadius: 12, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
    imagePlaceholderText: { color: '#999' },
    photoButton: {
        marginTop: 10,
        backgroundColor: '#5856D6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    photoButtonText: { color: '#fff', fontWeight: 'bold' },
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
    pickerContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
    },
    picker: { height: 50, width: '100%' },
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
