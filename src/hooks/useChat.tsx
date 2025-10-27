import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  type: string;
  sent_at: string;
  read_at: string | null;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  conversation_started: boolean;
  first_message_by: string | null;
  last_activity: string | null;
  location_id: string | null;
}

export interface MatchWithProfile extends Match {
  otherUser: {
    id: string;
    name: string;
    photos: string[];
  };
  lastMessage?: Message;
  unreadCount: number;
}

export const useChat = (matchId?: string) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch all matches for the current user
  useEffect(() => {
    if (!user) return;

    let isFetching = false;
    let debounceTimer: NodeJS.Timeout;

    const fetchMatches = async () => {
      if (isFetching) return;
      
      try {
        isFetching = true;
        setLoading(true);
        
        // Get all matches where user is either user1 or user2
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order("last_activity", { ascending: false });

        if (matchesError) throw matchesError;

        if (!matchesData || matchesData.length === 0) {
          setMatches([]);
          return;
        }

        // Get all other user IDs
        const otherUserIds = matchesData.map(match => 
          match.user1_id === user.id ? match.user2_id : match.user1_id
        );

        // Batch fetch all profiles in one query
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, photos")
          .in("id", otherUserIds);

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Batch fetch last messages for all matches
        const matchIds = matchesData.map(m => m.id);
        const { data: allMessages } = await supabase
          .from("messages")
          .select("*")
          .in("match_id", matchIds)
          .order("sent_at", { ascending: false });

        // Create a map of last message per match
        const lastMessagesMap = new Map();
        allMessages?.forEach(msg => {
          if (!lastMessagesMap.has(msg.match_id)) {
            lastMessagesMap.set(msg.match_id, msg);
          }
        });

        // Batch count unread messages for all matches
        const unreadCounts = await Promise.all(
          matchesData.map(async (match) => {
            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("match_id", match.id)
              .eq("receiver_id", user.id)
              .is("read_at", null);
            return { matchId: match.id, count: count || 0 };
          })
        );

        const unreadCountsMap = new Map(unreadCounts.map(u => [u.matchId, u.count]));

        // Combine all data
        const matchesWithData: MatchWithProfile[] = matchesData.map((match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const profile = profilesMap.get(otherUserId);
          
          return {
            ...match,
            otherUser: profile || { id: otherUserId, name: "Unknown", photos: [] },
            lastMessage: lastMessagesMap.get(match.id),
            unreadCount: unreadCountsMap.get(match.id) || 0,
          };
        });

        setMatches(matchesWithData);
      } catch (error: any) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os matches",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        isFetching = false;
      }
    };

    fetchMatches();

    // Debounced refetch function
    const debouncedRefetch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchMatches();
      }, 500); // Wait 500ms before refetching
    };

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel("matches-changes")
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

    // Subscribe to messages changes to update unread counts and last message
    const messagesChannel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          debouncedRefetch();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  // Fetch messages for a specific match
  useEffect(() => {
    if (!user || !matchId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", matchId)
          .order("sent_at", { ascending: true });

        if (error) throw error;

        setMessages(data || []);

        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("match_id", matchId)
          .eq("receiver_id", user.id)
          .is("read_at", null);
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive",
        });
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          
          // Mark as read if I'm the receiver
          if ((payload.new as Message).receiver_id === user.id) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", (payload.new as Message).id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, matchId]);

  const sendMessage = async (matchId: string, receiverId: string, text: string) => {
    if (!user || !text.trim()) return;

    try {
      setSending(true);

      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: user.id,
        receiver_id: receiverId,
        message: text,
        type: "text",
      });

      if (error) throw error;

      // Update match's last_activity
      await supabase
        .from("matches")
        .update({
          last_activity: new Date().toISOString(),
          conversation_started: true,
          first_message_by: user.id,
        })
        .eq("id", matchId);

      // Send notification to receiver
      try {
        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        await supabase.functions.invoke("send-notification", {
          body: {
            userId: receiverId,
            title: `💬 Nova mensagem de ${senderProfile?.name}`,
            body: text.length > 50 ? text.substring(0, 50) + "..." : text,
            data: {
              type: "message",
              matchId: matchId,
              fromUserId: user.id,
              fromUserName: senderProfile?.name,
            },
          },
        });
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't fail the message if notification fails
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return {
    matches,
    messages,
    loading,
    sending,
    sendMessage,
  };
};
