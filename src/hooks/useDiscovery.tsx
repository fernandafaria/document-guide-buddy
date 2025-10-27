import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface DiscoveryUser {
  id: string;
  name: string;
  age: number;
  gender: string;
  profession?: string;
  photos: string[];
  intentions: string[];
  musical_styles?: string[];
  languages?: string[];
  alcohol?: string;
  education?: string;
  religion?: string;
  zodiac_sign?: string;
  about_me?: string;
  current_check_in?: {
    location_id: string;
    location_name: string;
    checked_in_at: string;
    expires_at: string;
  };
}

export interface DiscoveryFilters {
  intentions?: string[];
  genders?: string[];
  minAge?: number;
  maxAge?: number;
  education?: string;
  alcohol?: string;
  musicalStyles?: string[];
  languages?: string[];
}

export const useDiscovery = (filters?: DiscoveryFilters) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const isFetchingRef = useRef(false);

  const fetchDiscoveryUsers = useCallback(async () => {
    if (!user || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
      try {
        setLoading(true);

        // Get current user's profile and their check-in location
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("current_check_in, gender")
          .eq("id", user.id)
          .single();

        console.log("🔍 My profile:", myProfile);

        // If user is not checked in, return empty array
        if (!myProfile?.current_check_in) {
          console.log("❌ User not checked in");
          setUsers([]);
          setLoading(false);
          return;
        }

        const myLocationId = (myProfile.current_check_in as any).location_id;
        console.log("📍 My location ID:", myLocationId);

        // Build query for users with active check-ins at the same location (server-side filtered)
        let query = supabase
          .from("profiles")
          .select("*")
          .not("id", "eq", user.id)
          .filter("current_check_in->>location_id", "eq", myLocationId)
          .filter("current_check_in->>expires_at", "gt", new Date().toISOString());

        // Apply filters
        if (filters?.intentions && filters.intentions.length > 0) {
          query = query.overlaps("intentions", filters.intentions);
          console.log("🎯 Filtering by intentions:", filters.intentions);
        }

        if (filters?.genders && filters.genders.length > 0) {
          query = query.in("gender", filters.genders);
          console.log("👤 Filtering by genders:", filters.genders);
        }

        if (filters?.minAge) {
          query = query.gte("age", filters.minAge);
          console.log("📅 Min age:", filters.minAge);
        }

        if (filters?.maxAge) {
          query = query.lte("age", filters.maxAge);
          console.log("📅 Max age:", filters.maxAge);
        }

        if (filters?.education) {
          query = query.eq("education", filters.education);
          console.log("🎓 Filtering by education:", filters.education);
        }

        if (filters?.alcohol) {
          query = query.eq("alcohol", filters.alcohol);
          console.log("🍷 Filtering by alcohol:", filters.alcohol);
        }

        if (filters?.musicalStyles && filters.musicalStyles.length > 0) {
          query = query.overlaps("musical_styles", filters.musicalStyles);
          console.log("🎵 Filtering by musical styles:", filters.musicalStyles);
        }

        if (filters?.languages && filters.languages.length > 0) {
          query = query.overlaps("languages", filters.languages);
          console.log("🌍 Filtering by languages:", filters.languages);
        }

        const { data, error } = await query;

        if (error) throw error;

        console.log("📦 Total profiles from query:", data?.length || 0);

        // Filter users at the same location with non-expired check-ins
        const now = new Date();
        const activeUsers = (data || []).filter((profile) => {
          if (!profile.current_check_in) {
            console.log(`❌ ${profile.name}: No check-in`);
            return false;
          }
          const checkIn = profile.current_check_in as any;
          if (!checkIn.expires_at) {
            console.log(`❌ ${profile.name}: No expiration date`);
            return false;
          }
          if (checkIn.location_id !== myLocationId) {
            console.log(`❌ ${profile.name}: Different location (${checkIn.location_id} vs ${myLocationId})`);
            return false;
          }
          const expiresAt = new Date(checkIn.expires_at);
          if (expiresAt <= now) {
            console.log(`❌ ${profile.name}: Check-in expired`);
            return false;
          }
          console.log(`✅ ${profile.name}: Active at same location`);
          return true;
        });

        console.log("✅ Active users at same location:", activeUsers.length);

        // Get users I've already liked
        const { data: myLikes } = await supabase
          .from("likes")
          .select("to_user_id")
          .eq("from_user_id", user.id);

        const likedUserIds = new Set(myLikes?.map((like) => like.to_user_id) || []);
        console.log("💕 Already liked users:", likedUserIds.size);

        // Filter out users I've already liked
        const usersToShow = activeUsers.filter(
          (profile) => {
            const alreadyLiked = likedUserIds.has(profile.id);
            if (alreadyLiked) {
              console.log(`❌ ${profile.name}: Already liked`);
            }
            return !alreadyLiked;
          }
        );

        console.log("🎯 Final users to show:", usersToShow.length);
        setUsers(usersToShow as any);
      } catch (error: any) {
        console.error("Error fetching discovery users:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive",
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user, filters]);

  useEffect(() => {
    if (!user) return;

    fetchDiscoveryUsers();

    // Debounced refetch function with improved timing
    const debouncedRefetch = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchDiscoveryUsers();
      }, 800);
    };

    // Subscribe to profile changes (check-ins/check-outs)
    const profilesChannel = supabase
      .channel("profiles-discovery-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          debouncedRefetch();
        }
      )
      .subscribe();

    // Subscribe to likes changes
    const likesChannel = supabase
      .channel("likes-discovery-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
        },
        () => {
          debouncedRefetch();
        }
      )
      .subscribe();

    // Fallback polling to ensure updates even if realtime misses events
    const interval = setInterval(() => {
      fetchDiscoveryUsers();
    }, 10000); // every 10s

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      clearInterval(interval);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [user, filters, fetchDiscoveryUsers]);

  const sendYo = async (toUserId: string, locationId?: string) => {
    if (!user) return;

    try {
      // Use the edge function to process the like
      const { data, error } = await supabase.functions.invoke('process-like', {
        body: {
          toUserId,
          locationId,
          action: 'like',
        },
      });

      if (error) throw error;

      // Show appropriate message based on match status
      if (data?.isMatch) {
        toast({
          title: "🎉 É um Match!",
          description: "Vocês deram match! Agora podem conversar.",
        });
      } else {
        toast({
          title: "YO enviado!",
          description: "Aguarde para ver se vai dar match",
        });
      }

      // Remove user from discovery list
      setUsers((prev) => prev.filter((u) => u.id !== toUserId));
    } catch (error: any) {
      console.error("Error sending YO:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o YO",
        variant: "destructive",
      });
    }
  };

  const skipUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return {
    users,
    loading,
    sendYo,
    skipUser,
  };
};
