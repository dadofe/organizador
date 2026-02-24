import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface BoxCardProps {
    id: string;
    name: string;
    description?: string;
    location?: string;
    onPress: () => void;
}

export default function BoxCard({ name, description, location, onPress }: BoxCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Text style={styles.title}>{name}</Text>
            {description && <Text style={styles.desc}>{description}</Text>}
            {location && <Text style={styles.location}>📍 {location}</Text>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    desc: { fontSize: 14, color: '#666', marginBottom: 4 },
    location: { fontSize: 12, color: '#333' },
});
