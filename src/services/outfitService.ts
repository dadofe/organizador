import { supabase } from './supabaseClient';

export const getOutfits = async () => {
    const { data, error } = await supabase.from('outfits').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const getOutfitById = async (id: string) => {
    const { data: outfit, error: outfitError } = await supabase.from('outfits').select('*').eq('id', id).single();
    if (outfitError) throw outfitError;

    const { data: clothes, error: clothesError } = await supabase
        .from('outfit_clothes')
        .select('clothes(*)')
        .eq('outfit_id', id);
    if (clothesError) throw clothesError;

    return { ...outfit, clothes: clothes.map((item: any) => item.clothes) };
};

export const createOutfit = async (outfitData: { name: string; description?: string }, clothesIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    const payload = { ...outfitData, user_id: user.id };
    const { data: outfit, error: outfitError } = await supabase.from('outfits').insert([payload]).select().single();
    if (outfitError) throw outfitError;

    if (clothesIds.length > 0) {
        const junctionPayload = clothesIds.map(clothId => ({
            outfit_id: outfit.id,
            clothes_id: clothId
        }));
        const { error: junctionError } = await supabase.from('outfit_clothes').insert(junctionPayload);
        if (junctionError) throw junctionError;
    }

    return outfit;
};

export const deleteOutfit = async (id: string) => {
    // La base de datos tiene ON DELETE CASCADE para outfit_clothes
    const { error } = await supabase.from('outfits').delete().eq('id', id);
    if (error) {
        console.error('Error al borrar conjunto:', error);
        throw error;
    }
    return true;
};
