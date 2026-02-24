import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nynhcqbfpnneyizeniye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bmhjcWJmcG5uZXlpemVuaXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjQyNTYsImV4cCI6MjA4NzQwMDI1Nn0.5rqD_IKUkhglGZ6rKtIa1XgHGjk0g0GvBqTvgBLS2DQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
