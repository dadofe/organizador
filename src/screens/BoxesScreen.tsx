import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getBoxes, createBox } from '../services/boxService';
import BoxCard from '../components/BoxCard';

export default function BoxesScreen({ navigation }: any) {
    const [boxes, setBoxes] = useState<any[]>([]);
    const [filteredBoxes, setFilteredBoxes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const loadBoxes = async () => {
        try {
            setLoading(true);
            const data = await getBoxes();
            setBoxes(data || []);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadBoxes();
        }
    }, [isFocused]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBoxes(boxes);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = boxes.filter(box =>
                box.name.toLowerCase().includes(query) ||
                (box.location && box.location.toLowerCase().includes(query))
            );
            setFilteredBoxes(filtered);
        }
    }, [searchQuery, boxes]);

    const handleCreateBox = () => {
        navigation.navigate('BoxEdit');
    };

    if (loading && boxes.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar cajas por nombre o sitio..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredBoxes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <BoxCard
                        id={item.id}
                        name={item.name}
                        description={item.description}
                        location={item.location}
                        onPress={() => navigation.navigate('BoxDetail', { boxId: item.id })}
                    />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No tienes cajas. Crea una nueva.</Text>}
                contentContainerStyle={styles.listContainer}
            />
            <TouchableOpacity style={styles.fab} onPress={handleCreateBox}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    clearButton: { marginLeft: 10, padding: 5 },
    clearButtonText: { fontSize: 18, color: '#999' },
    listContainer: { paddingVertical: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#007AFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    fabText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
});
