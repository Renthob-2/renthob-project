import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { playNotificationSound, requestBrowserNotificationPermission, showBrowserNotification } from "@/utils/notificationSound";

export interface ChatRoom {
  id: string;
  property_id: string;
  name: string;
  created_by: string;
  created_at: string;
  property?: { title: string; location: string } | null;
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  status: string;
  invited_by: string;
  created_at: string;
  profile?: { full_name: string | null; email: string | null; username: string | null } | null;
}

export interface ChatRoomMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_profile?: { full_name: string | null; email: string | null } | null;
}

export interface PendingInvite {
  id: string;
  room_id: string;
  status: string;
  created_at: string;
  invited_by: string;
  room?: ChatRoom;
  inviter_profile?: { full_name: string | null; email: string | null } | null;
}

export function useChatRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    if (!user) { setRooms([]); setPendingInvites([]); setLoading(false); return; }

    try {
      // Fetch memberships
      const { data: memberships } = await supabase
        .from("chat_room_members")
        .select("*")
        .eq("user_id", user.id);

      if (!memberships || memberships.length === 0) {
        setRooms([]);
        setPendingInvites([]);
        setLoading(false);
        return;
      }

      const approvedRoomIds = memberships.filter(m => m.status === "approved").map(m => m.room_id);
      const pendingMemberships = memberships.filter(m => m.status === "pending");

      // Fetch approved rooms
      if (approvedRoomIds.length > 0) {
        const { data: roomsData } = await supabase
          .from("chat_rooms")
          .select("*")
          .in("id", approvedRoomIds);

        if (roomsData) {
          const propertyIds = [...new Set(roomsData.map(r => r.property_id))];
          const { data: properties } = await supabase
            .from("properties")
            .select("id, title, location")
            .in("id", propertyIds);

          setRooms(roomsData.map(r => ({
            ...r,
            property: properties?.find(p => p.id === r.property_id) || null,
          })));
        }
      } else {
        setRooms([]);
      }

      // Fetch pending invites with room details
      if (pendingMemberships.length > 0) {
        const pendingRoomIds = pendingMemberships.map(m => m.room_id);
        const { data: pendingRoomsData } = await supabase
          .from("chat_rooms")
          .select("*")
          .in("id", pendingRoomIds);

        const inviterIds = [...new Set(pendingMemberships.map(m => m.invited_by))];
        const { data: inviterProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", inviterIds);

        // Get property info for pending rooms
        const pendingPropertyIds = [...new Set((pendingRoomsData || []).map(r => r.property_id))];
        const { data: pendingProperties } = pendingPropertyIds.length > 0
          ? await supabase.from("properties").select("id, title, location").in("id", pendingPropertyIds)
          : { data: [] };

        setPendingInvites(pendingMemberships.map(m => {
          const room = pendingRoomsData?.find(r => r.id === m.room_id);
          return {
            ...m,
            room: room ? {
              ...room,
              property: pendingProperties?.find(p => p.id === room.property_id) || null,
            } : undefined,
            inviter_profile: inviterProfiles?.find(p => p.user_id === m.invited_by) || null,
          };
        }));
      } else {
        setPendingInvites([]);
      }
    } catch (err) {
      console.error("Error fetching chat rooms:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // Also fetch rooms created by this user (as creator, auto-approved)
  const fetchCreatedRooms = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("created_by", user.id);

    if (data && data.length > 0) {
      const propertyIds = [...new Set(data.map(r => r.property_id))];
      const { data: properties } = await supabase
        .from("properties")
        .select("id, title, location")
        .in("id", propertyIds);

      const createdRooms = data.map(r => ({
        ...r,
        property: properties?.find(p => p.id === r.property_id) || null,
      }));

      setRooms(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const newRooms = createdRooms.filter(r => !existingIds.has(r.id));
        return [...prev, ...newRooms];
      });
    }
  }, [user]);

  useEffect(() => { fetchCreatedRooms(); }, [fetchCreatedRooms]);

  // Realtime subscription for new invite notifications
  const prevInviteCountRef = useRef<number | null>(null);

  // Request browser notification permission on mount
  useEffect(() => {
    if (user) requestBrowserNotificationPermission();
  }, [user]);

  useEffect(() => {
    if (prevInviteCountRef.current === null) {
      prevInviteCountRef.current = pendingInvites.length;
    } else if (pendingInvites.length > prevInviteCountRef.current) {
      const newCount = pendingInvites.length - prevInviteCountRef.current;
      const message = `You have ${newCount} new group chat invitation${newCount > 1 ? "s" : ""}. Check your Group Chats to respond.`;
      
      // In-app toast
      toast({
        title: "New Group Chat Invite",
        description: message,
      });
      
      // Sound effect
      playNotificationSound();
      
      // Browser notification (when tab is in background)
      showBrowserNotification("New Group Chat Invite", message);
      
      prevInviteCountRef.current = pendingInvites.length;
    } else {
      prevInviteCountRef.current = pendingInvites.length;
    }
  }, [pendingInvites.length]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("chat-room-invites")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_room_members",
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchRooms]);

  const createRoom = async (propertyId: string, name: string) => {
    if (!user) throw new Error("Must be logged in");

    const { data: room, error } = await supabase
      .from("chat_rooms")
      .insert({ property_id: propertyId, name, created_by: user.id })
      .select()
      .single();

    if (error) throw error;

    // Add creator as approved member
    await supabase.from("chat_room_members").insert({
      room_id: room.id,
      user_id: user.id,
      status: "approved",
      invited_by: user.id,
    });

    await fetchRooms();
    await fetchCreatedRooms();
    return room;
  };

  const inviteMember = async (roomId: string, userId: string) => {
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
      .from("chat_room_members")
      .insert({ room_id: roomId, user_id: userId, invited_by: user.id });

    if (error) throw error;
  };

  const respondToInvite = async (membershipId: string, accept: boolean) => {
    const { error } = await supabase
      .from("chat_room_members")
      .update({ status: accept ? "approved" : "rejected" })
      .eq("id", membershipId);

    if (error) throw error;
    await fetchRooms();
  };

  return { rooms, pendingInvites, loading, createRoom, inviteMember, respondToInvite, refetch: fetchRooms };
}

export function useChatRoomMessages(roomId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatRoomMessage[]>([]);
  const [members, setMembers] = useState<ChatRoomMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!roomId || !user) { setMessages([]); setLoading(false); return; }

    const { data } = await supabase
      .from("chat_room_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (data) {
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", senderIds);

      setMessages(data.map(m => ({
        ...m,
        sender_profile: profiles?.find(p => p.user_id === m.sender_id) || null,
      })));
    }
    setLoading(false);
  }, [roomId, user]);

  const fetchMembers = useCallback(async () => {
    if (!roomId) { setMembers([]); return; }

    const { data } = await supabase
      .from("chat_room_members")
      .select("*")
      .eq("room_id", roomId);

    if (data) {
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, username")
        .in("user_id", userIds);

      setMembers(data.map(m => ({
        ...m,
        profile: profiles?.find(p => p.user_id === m.user_id) || null,
      })));
    }
  }, [roomId]);

  useEffect(() => { fetchMessages(); fetchMembers(); }, [fetchMessages, fetchMembers]);

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_room_messages",
        filter: `room_id=eq.${roomId}`,
      }, () => { fetchMessages(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, fetchMessages]);

  const sendMessage = async (message: string) => {
    if (!user || !roomId) throw new Error("Cannot send message");

    const { error } = await supabase
      .from("chat_room_messages")
      .insert({ room_id: roomId, sender_id: user.id, message });

    if (error) throw error;
    await fetchMessages();
  };

  return { messages, members, loading, sendMessage, refetch: fetchMessages, refetchMembers: fetchMembers };
}
