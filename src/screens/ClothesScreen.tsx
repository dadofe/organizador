import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getClothes, createCloth, addClothToBox, removeClothFromBox, getClothesByBox } from '../services/clothesService';
import ClothCard from '../components/ClothCard';

export default function ClothesScreen({ route, navigation }: any) {
    const { selectingForBox } = route.params || {};
    const [clothes, setClothes] = useState<any[]>([]);
    const [filteredClothes, setFilteredClothes] = useState<any[]>([]);
    const [selectedClothIds, setSelectedClothIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const loadClothes = async () => {
        try {
            setLoading(true);
            const allClothes = await getClothes();
            setClothes(allClothes || []);

            if (selectingForBox) {
                const boxClothes = await getClothesByBox(selectingForBox);
                setSelectedClothIds(boxClothes.map((c: any) => c.id));
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadClothes();
        }
    }, [isFocused]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredClothes(clothes);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = clothes.filter(cloth =>
                cloth.name.toLowerCase().includes(query) ||
                (cloth.type && cloth.type.toLowerCase().includes(query)) ||
                (cloth.brand && cloth.brand.toLowerCase().includes(query))
            );
            setFilteredClothes(filtered);
        }
    }, [searchQuery, clothes]);

    const handleCreateCloth = () => {
        navigation.navigate('ClothEdit');
    };

    const toggleClothSelection = async (clothId: string) => {
        if (!selectingForBox) return;

        try {
            const isSelected = selectedClothIds.includes(clothId);
            if (isSelected) {
                await removeClothFromBox(selectingForBox, clothId);
                setSelectedClothIds(selectedClothIds.filter(id => id !== clothId));
            } else {
                await addClothToBox(selectingForBox, clothId);
                setSelectedClothIds([...selectedClothIds, clothId]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar prendas por nombre, tipo..."
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
                data={filteredClothes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isSelected = selectedClothIds.includes(item.id);
                    return (
                        <View style={styles.cardWrapper}>
                            <ClothCard
                                id={item.id}
                                name={item.name}
                                type={item.type}
                                brand={item.brand}
                                size={item.size}
                                color={item.color}
                                imageUrl={item.image_url}
                                onPress={() => {
                                    if (selectingForBox) {
                                        toggleClothSelection(item.id);
                                    } else {
                                        navigation.navigate('ClothDetail', { clothId: item.id });
                                    }
                                }}
                            />
                            {selectingForBox && (
                                <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
                                    <Text style={styles.selectionText}>{isSelected ? '✅' : '➕'}</Text>
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay prendas que coincidan.</Text>}
                contentContainerStyle={styles.listContainer}
            />
            {!selectingForBox && (
                <TouchableOpacity style={styles.fab} onPress={handleCreateCloth}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
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
    listContainer: { paddingVertical: 10, paddingBottom: 100 },
    cardWrapper: { position: 'relative' },
    selectionIndicator: {
        position: 'absolute',
        top: 20,
        right: 25,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedIndicator: {
        backgroundColor: '#E6F2FF',
        borderColor: '#007AFF',
    },
    selectionText: { fontSize: 18 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#FF9500',
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
