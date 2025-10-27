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
  const [sentYos, setSentYos] = useState<Set<string>>(new Set());
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

        // If user is not checked in, return empty array
        if (!myProfile?.current_check_in) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const myLocationId = (myProfile.current_check_in as any).location_id;

        // Fetch users at my location via backend function (authoritative)
        const { data: usersResp, error } = await supabase.functions.invoke('get-users-at-location', {
          body: { locationId: myLocationId },
        });

        if (error) throw error;

        // Raw users from backend
        let data = (usersResp as any)?.users || [];

        // Filter users at the same location with non-expired check-ins
        const now = new Date();
        const activeUsers = (data || []).filter((profile) => {
          if (!profile.current_check_in) return false;
          const checkIn = profile.current_check_in as any;
          if (!checkIn.expires_at) return false;
          if (checkIn.location_id !== myLocationId) return false;
          const expiresAt = new Date(checkIn.expires_at);
          if (expiresAt <= now) return false;
          return true;
        });

        // Get users I've already liked
        const { data: myLikes } = await supabase
          .from("likes")
          .select("to_user_id")
          .eq("from_user_id", user.id);

        const likedUserIds = new Set(myLikes?.map((like) => like.to_user_id) || []);

        // Get users I've already matched with
        const { data: myMatches } = await supabase
          .from("matches")
          .select("user1_id, user2_id")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        const matchedUserIds = new Set(
          (myMatches || []).map((match) =>
            match.user1_id === user.id ? match.user2_id : match.user1_id
          )
        );

        // Do NOT remove liked users; keep them and mark as YO enviado (except when already matched)
        const likedNotMatchedIds = Array.from(likedUserIds).filter((id) => !matchedUserIds.has(id));
        
        // Replace sentYos with current likes (removes unliked users)
        setSentYos(new Set(likedNotMatchedIds));

        // Remove matched users from discovery - they should only appear in Matches page
        const usersToShow = activeUsers.filter((user: any) => !matchedUserIds.has(user.id));

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

    // Subscribe to matches changes (unmatch should refresh buttons)
    const matchesChannel = supabase
      .channel("matches-discovery-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          debouncedRefetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(matchesChannel);
    };
  }, [user, filters, fetchDiscoveryUsers]);

  // Also refresh when window regains focus or tab becomes visible
  useEffect(() => {
    if (!user) return;
    const onFocus = () => fetchDiscoveryUsers();
    const onVisibility = () => {
      if (!document.hidden) fetchDiscoveryUsers();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user, fetchDiscoveryUsers]);

  const sendYo = async (toUserId: string, locationId?: string, matchProfile?: any) => {
    if (!user) {
      return null;
    }

    try {
      // Optimistic: mark as YO sent immediately
      setSentYos((prev) => {
        const s = new Set(prev);
        s.add(toUserId);
        return s;
      });

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
        
        // Get match_id for navigation
        const { data: matchData } = await supabase
          .from("matches")
          .select("id")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .or(`user1_id.eq.${toUserId},user2_id.eq.${toUserId}`)
          .single();

        // Remove user from discovery list on match
        setUsers((prev) => prev.filter((u) => u.id !== toUserId));
        
        return { isMatch: true, matchId: matchData?.id, matchProfile };
      } else {
        
        // Mark as YO sent but keep in list
        setSentYos((prev) => {
          const newSet = new Set(prev);
          newSet.add(toUserId);
          return newSet;
        });
        
        toast({
          title: "YO enviado!",
          description: "Aguarde para ver se vai dar match",
        });
        
        return { isMatch: false };
      }
    } catch (error: any) {
      console.error("❌ Error sending YO:", error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível enviar o YO",
        variant: "destructive",
      });
      return null;
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
    sentYos,
  };
};
