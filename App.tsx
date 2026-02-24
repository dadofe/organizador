import '@expo/metro-runtime';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

// Services
import { supabase } from './src/services/supabaseClient';

export type RootStackParamList = {
    Auth: undefined;
    Home: undefined;
    Boxes: undefined;
    BoxDetail: { boxId: string };
    BoxEdit: { existingBox?: any } | undefined;
    Clothes: undefined;
    ClothDetail: { clothId?: string, boxId?: string }; // Optional params for editing or adding to specific box
    ClothEdit: { existingCloth?: any } | undefined;
    Scanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator>
                    {session && session.user ? (
                        <>
                            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Organizador' }} />
                            <Stack.Screen name="Boxes" component={BoxesScreen} options={{ title: 'Mis Cajas' }} />
                            <Stack.Screen name="BoxDetail" component={BoxDetailScreen} options={{ title: 'Detalle de Caja' }} />
                            <Stack.Screen name="BoxEdit" component={BoxEditScreen} options={{ title: 'Nueva Caja' }} />
                            <Stack.Screen name="Clothes" component={ClothesScreen} options={{ title: 'Mis Prendas' }} />
                            <Stack.Screen name="ClothDetail" component={ClothDetailScreen} options={{ title: 'Detalle de Prenda' }} />
                            <Stack.Screen name="ClothEdit" component={ClothEditScreen} options={{ title: 'Nueva Prenda' }} />
                            <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Escanear QR' }} />
                        </>
                    ) : (
                        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
