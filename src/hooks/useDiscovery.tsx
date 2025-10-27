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
          .select("current_check_in")
          .eq("id", user.id)
          .single();

        // If user is not checked in, return empty array
        if (!myProfile?.current_check_in) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const myLocationId = (myProfile.current_check_in as any).location_id;

        // Build query for users with active check-ins at the same location
        let query = supabase
          .from("profiles")
          .select("*")
          .not("id", "eq", user.id)
          .not("current_check_in", "is", null);

        // Apply filters
        if (filters?.intentions && filters.intentions.length > 0) {
          query = query.overlaps("intentions", filters.intentions);
        }

        if (filters?.genders && filters.genders.length > 0) {
          query = query.in("gender", filters.genders);
        }

        if (filters?.minAge) {
          query = query.gte("age", filters.minAge);
        }

        if (filters?.maxAge) {
          query = query.lte("age", filters.maxAge);
        }

        if (filters?.education) {
          query = query.eq("education", filters.education);
        }

        if (filters?.alcohol) {
          query = query.eq("alcohol", filters.alcohol);
        }

        if (filters?.musicalStyles && filters.musicalStyles.length > 0) {
          query = query.overlaps("musical_styles", filters.musicalStyles);
        }

        if (filters?.languages && filters.languages.length > 0) {
          query = query.overlaps("languages", filters.languages);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Filter users at the same location with non-expired check-ins
        const now = new Date();
        const activeUsers = (data || []).filter((profile) => {
          if (!profile.current_check_in) return false;
          const checkIn = profile.current_check_in as any;
          if (!checkIn.expires_at) return false;
          if (checkIn.location_id !== myLocationId) return false; // Only same location
          const expiresAt = new Date(checkIn.expires_at);
          return expiresAt > now;
        });

        // Get users I've already liked
        const { data: myLikes } = await supabase
          .from("likes")
          .select("to_user_id")
          .eq("from_user_id", user.id);

        const likedUserIds = new Set(myLikes?.map((like) => like.to_user_id) || []);

        // Filter out users I've already liked
        const usersToShow = activeUsers.filter(
          (profile) => !likedUserIds.has(profile.id)
        );

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

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
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
