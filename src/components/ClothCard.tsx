import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ClothCardProps {
    id: string;
    name: string;
    type?: string;
    color?: string;
    brand?: string;
    size?: string;
    imageUrl?: string;
    onPress: () => void;
}

export default function ClothCard({ name, type, color, brand, size, imageUrl, onPress }: ClothCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.emoji}>👕</Text>
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.details}>
                    {[type, brand, size, color].filter(Boolean).join(' • ')}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    imagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: { fontSize: 30 },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    details: { fontSize: 14, color: '#666' },
});
