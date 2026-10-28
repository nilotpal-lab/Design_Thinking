import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwpewnknspjvlucvzjwx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cGV3bmtuc3Bqdmx1Y3Z6and4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNzE1MjIsImV4cCI6MjEwODc0NzUyMn0.u6dDLAmxWJKP21fPxfZq2vmKzn1rS8Z-2KpBJQskEEA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
