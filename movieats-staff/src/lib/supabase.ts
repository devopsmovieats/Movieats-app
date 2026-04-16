import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://keznrlttvchfeucymbvh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlem5ybHR0dmNoZmV1Y3ltYnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMzNzIsImV4cCI6MjA5MTA1OTM3Mn0.OXwrMnjLNmoGIZ40miZ3gR8bFWNm9bTlRI3Qpb-GhVA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
