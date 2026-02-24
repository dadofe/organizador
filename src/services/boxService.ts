import { supabase } from './supabaseClient';

export const getBoxes = async () => {
    const { data, error } = await supabase.from('boxes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const getBoxById = async (id: string) => {
    const { data, error } = await supabase.from('boxes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

export const createBox = async (boxData: { name: string; description?: string; location?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    const payload = { ...boxData, user_id: user.id };
    const { data, error } = await supabase.from('boxes').insert([payload]).select().single();
    if (error) throw error;
    return data;
};

export const updateBoxQRCode = async (id: string, qrCode: string) => {
    const { data, error } = await supabase.from('boxes').update({ qr_code: qrCode }).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const updateBox = async (id: string, boxData: { name: string; description?: string; location?: string }) => {
    const { data, error } = await supabase.from('boxes').update(boxData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const deleteBox = async (id: string) => {
    const { error } = await supabase.from('boxes').delete().eq('id', id);
    if (error) throw error;
    return true;
};
