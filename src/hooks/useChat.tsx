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

    const fetchMatches = async () => {
      try {
        setLoading(true);
        console.log("Fetching matches for user:", user.id);
        
        // Get all matches where user is either user1 or user2
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order("last_activity", { ascending: false });

        if (matchesError) {
          console.error("Error fetching matches:", matchesError);
          throw matchesError;
        }

        console.log("Matches found:", matchesData?.length);

        // Validate matches - ensure both users have liked each other
        const validatedMatches = [];
        for (const match of matchesData || []) {
          // Check if both likes exist
          const { data: likesCheck } = await supabase
            .from("likes")
            .select("from_user_id, to_user_id")
            .or(
              `and(from_user_id.eq.${match.user1_id},to_user_id.eq.${match.user2_id}),and(from_user_id.eq.${match.user2_id},to_user_id.eq.${match.user1_id})`
            );

          // Only include match if both users have liked each other
          if (likesCheck && likesCheck.length === 2) {
            validatedMatches.push(match);
          } else {
            console.warn("Invalid match found (missing reciprocal likes):", match.id);
            // Delete invalid match
            await supabase.from("matches").delete().eq("id", match.id);
          }
        }

        console.log("Valid matches after validation:", validatedMatches.length);

        // For each match, get the other user's profile and last message
        const matchesWithData = await Promise.all(
          validatedMatches.map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            console.log("Fetching profile for user:", otherUserId);

            // Get other user's profile
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("id, name, photos")
              .eq("id", otherUserId)
              .single();

            if (profileError) {
              console.error("Error fetching profile for user:", otherUserId, profileError);
            } else {
              console.log("Profile fetched successfully:", profile?.name);
            }

            // Get last message
            const { data: lastMessage } = await supabase
              .from("messages")
              .select("*")
              .eq("match_id", match.id)
              .order("sent_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            // Get unread count
            const { count: unreadCount } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("match_id", match.id)
              .eq("receiver_id", user.id)
              .is("read_at", null);

            return {
              ...match,
              otherUser: profile || { id: otherUserId, name: "Unknown", photos: [] },
              lastMessage,
              unreadCount: unreadCount || 0,
            };
          })
        );

        console.log("Matches with data:", matchesWithData.length);
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
      }
    };

    fetchMatches();

    // Subscribe to matches changes (new matches and deleted matches)
    const matchesChannel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          console.log("Match changed:", payload);
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
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
