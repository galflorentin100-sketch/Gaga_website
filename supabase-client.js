// יוצר לקוח Supabase גלובלי אחד שכל שאר הקבצים משתמשים בו.
// נטען אחרי config.js ואחרי ה-CDN של supabase-js ב-HTML.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
