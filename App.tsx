import '@expo/metro-runtime';
import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import BoxesScreen from './src/screens/BoxesScreen';
import BoxDetailScreen from './src/screens/BoxDetailScreen';
import ClothesScreen from './src/screens/ClothesScreen';
import ClothDetailScreen from './src/screens/ClothDetailScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import BoxEditScreen from './src/screens/BoxEditScreen';
import ClothEditScreen from './src/screens/ClothEditScreen';
import OutfitsScreen from './src/screens/OutfitsScreen';
import OutfitEditScreen from './src/screens/OutfitEditScreen';

// Services
import { supabase } from './src/services/supabaseClient';

export type RootStackParamList = {
    Auth: undefined;
    Home: undefined;
    Boxes: undefined;
    BoxDetail: { boxId: string };
    BoxEdit: { existingBox?: any } | undefined;
    Clothes: undefined;
    ClothDetail: { clothId?: string, boxId?: string };
    ClothEdit: { existingCloth?: any } | undefined;
    Scanner: undefined;
    Outfits: undefined;
    OutfitEdit: { existingOutfit?: any } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#FF9500' },
                headerTintColor: '#fff',
                tabBarActiveTintColor: '#FF9500',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    backgroundColor: '#fff',
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
            }}
        >
            <Tab.Screen
                name="Inicio"
                component={HomeScreen}
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ size }) => <Text style={{ fontSize: size || 22 }}>🏠</Text>
                }}
            />
            <Tab.Screen
                name="CajasTab"
                component={BoxesScreen}
                options={{
                    title: 'Cajas',
                    tabBarIcon: ({ size }) => <Text style={{ fontSize: size || 22 }}>📦</Text>
                }}
            />
            <Tab.Screen
                name="RopaTab"
                component={ClothesScreen}
                options={{
                    title: 'Ropa',
                    tabBarIcon: ({ size }) => <Text style={{ fontSize: size || 22 }}>👕</Text>
                }}
            />
            <Tab.Screen
                name="OutfitsTab"
                component={OutfitsScreen}
                options={{
                    title: 'Outfits',
                    tabBarIcon: ({ size }) => <Text style={{ fontSize: size || 22 }}>✨</Text>
                }}
            />
            <Tab.Screen
                name="ScannerTab"
                component={ScannerScreen}
                options={{
                    title: 'Escanear',
                    tabBarIcon: ({ size }) => <Text style={{ fontSize: size || 22 }}>📷</Text>
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    const [session, setSession] = useState<any>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        // Fetch session initially
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitializing(false);
        }).catch(() => {
            setInitializing(false);
        });

        // Listen for changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    if (initializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#FF9500" />
            </View>
        );
    }

    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1 }}>
            <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator>
                    {session && session.user ? (
                        <>
                            <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
                            <Stack.Screen name="BoxDetail" component={BoxDetailScreen} options={{ title: 'Detalle de Caja' }} />
                            <Stack.Screen name="BoxEdit" component={BoxEditScreen} options={{ title: 'Editar Caja' }} />
                            <Stack.Screen name="ClothDetail" component={ClothDetailScreen} options={{ title: 'Detalle de Prenda' }} />
                            <Stack.Screen name="ClothEdit" component={ClothEditScreen} options={{ title: 'Editar Prenda' }} />
                            <Stack.Screen name="OutfitEdit" component={OutfitEditScreen} options={{ title: 'Sugerir Outfit' }} />
                        </>
                    ) : (
                        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
