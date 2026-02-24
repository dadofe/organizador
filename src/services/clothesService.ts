import { supabase } from './supabaseClient';

export const getClothes = async () => {
    const { data, error } = await supabase.from('clothes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const getClothById = async (id: string) => {
    const { data, error } = await supabase.from('clothes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

export const getClothesByBox = async (boxId: string) => {
    const { data, error } = await supabase
        .from('box_clothes')
        .select('clothes(*)')
        .eq('box_id', boxId);
    if (error) throw error;
    // Unwrap the joined data
    return data.map((item: any) => item.clothes);
};

export const createCloth = async (clothData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    const payload = { ...clothData, user_id: user.id };
    const { data, error } = await supabase.from('clothes').insert([payload]).select().single();
    if (error) throw error;
    return data;
};

export const addClothToBox = async (boxId: string, clothesId: string) => {
    const { data, error } = await supabase.from('box_clothes').insert([{ box_id: boxId, clothes_id: clothesId }]);
    if (error) throw error;
    return data;
};

export const removeClothFromBox = async (boxId: string, clothesId: string) => {
    const { error } = await supabase.from('box_clothes').delete().match({ box_id: boxId, clothes_id: clothesId });
    if (error) throw error;
    return true;
};

export const updateCloth = async (id: string, clothData: any) => {
    const { data, error } = await supabase.from('clothes').update(clothData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const deleteCloth = async (id: string) => {
    const { error } = await supabase.from('clothes').delete().eq('id', id);
    if (error) throw error;
    return true;
};

export const uploadClothImage = async (uri: string) => {
    const fileName = `${Date.now()}.jpg`;
    const formData = new FormData();

    // In Expo/React Native, we usually need to handle the file differently depending on the platform
    // For simplicity and compatibility, we'll try to fetch the local uri and upload it as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
        .from('clothes')
        .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(fileName);

    return publicUrl;
};
