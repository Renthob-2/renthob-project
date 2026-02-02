import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  property_id: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    email: string | null;
  };
  recipient_profile?: {
    full_name: string | null;
    email: string | null;
  };
  property?: {
    title: string;
    address: string | null;
  } | null;
}

export function useMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch messages where user is sender or recipient
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs and property IDs
      const userIds = [...new Set(messagesData.flatMap(m => [m.sender_id, m.recipient_id]))];
      const propertyIds = [...new Set(messagesData.map(m => m.property_id).filter(Boolean))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      // Fetch properties
      const { data: properties } = propertyIds.length > 0
        ? await supabase
            .from("properties")
            .select("id, title, address")
            .in("id", propertyIds)
        : { data: [] };

      // Map data together
      const enrichedMessages: Message[] = messagesData.map(msg => ({
        ...msg,
        sender_profile: profiles?.find(p => p.user_id === msg.sender_id) || undefined,
        recipient_profile: profiles?.find(p => p.user_id === msg.recipient_id) || undefined,
        property: properties?.find(p => p.id === msg.property_id) || null,
      }));

      setMessages(enrichedMessages);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch the sender's profile for the notification
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", payload.new.sender_id)
            .single();

          const senderName = senderProfile?.full_name || senderProfile?.email || "Someone";
          
          toast.info(`New message from ${senderName}`, {
            description: payload.new.subject,
            action: {
              label: "View",
              onClick: () => window.location.href = "/messages",
            },
          });

          // Refresh messages to include the new one
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMessages]);

  const sendMessage = async (
    recipientId: string,
    subject: string,
    message: string,
    propertyId?: string
  ) => {
    if (!user) throw new Error("Must be logged in to send messages");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        subject,
        message,
        property_id: propertyId || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Refresh messages
    await fetchMessages();
    return data;
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);

    if (error) throw error;

    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, is_read: true } : m))
    );
  };

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) throw error;

    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const unreadCount = messages.filter(
    m => m.recipient_id === user?.id && !m.is_read
  ).length;

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage,
    unreadCount,
    refetch: fetchMessages,
  };
}
