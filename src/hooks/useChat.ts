import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderProfileImageUrl?: string;
  messageText: string;
  timestamp: Timestamp;
}

export const useChat = (petId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !petId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(db, 'dogs', petId, 'chats');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Message, 'id'>
      }));
      setMessages(fetchedMessages);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("メッセージの取得に失敗しました。");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, petId]);

  const sendMessage = useCallback(async (messageText: string, senderName: string, senderProfileImageUrl?: string) => {
    if (!user || !petId || !messageText.trim()) {
      toast.error("メッセージを送信できませんでした。");
      return;
    }

    try {
      await addDoc(collection(db, 'dogs', petId, 'chats'), {
        senderId: user.uid,
        senderName,
        senderProfileImageUrl: senderProfileImageUrl || null,
        messageText: messageText.trim(),
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("メッセージの送信に失敗しました。");
    }
  }, [user, petId]);

  return { messages, loading, error, sendMessage };
};
