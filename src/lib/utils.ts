import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_AVATAR_URL = "https://api.dicebear.com/7.x/avataaars/svg?seed=User";

export function getPhotoUrl(photoPath: string): string {
  if (!photoPath) return DEFAULT_AVATAR_URL;
  
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  const { data } = supabase.storage.from("profile-photos").getPublicUrl(photoPath);
  return data.publicUrl;
}
