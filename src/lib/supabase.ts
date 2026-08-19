import { createClient } from "@supabase/supabase-js";

// Obtener las credenciales desde variables de entorno de Vite o usar las credenciales provistas como fallback seguro
const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

const fallbackUrl = "https://pwesvnavyyvbnpcvxail.supabase.co";
const fallbackKey = "sb_publishable_ydCSItbl72-5Rm-eb-SkNQ_2i3Yjp-W";

const isValidUrl = (url: any): boolean => {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed.startsWith("MY_") || trimmed.startsWith("YOUR_") || trimmed.includes("placeholder") || trimmed === "undefined" || trimmed === "null") {
    return false;
  }
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
};

const isValidKey = (key: any): boolean => {
  if (typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed === "" || trimmed.startsWith("MY_") || trimmed.startsWith("YOUR_") || trimmed.includes("placeholder") || trimmed === "undefined" || trimmed === "null") {
    return false;
  }
  return true;
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl!.trim() : fallbackUrl;
const supabaseAnonKey = isValidKey(rawKey) ? rawKey!.trim() : fallbackKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
