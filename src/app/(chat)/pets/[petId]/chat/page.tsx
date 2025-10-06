"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePets } from "@/hooks/usePets";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export const dynamic = "force-dynamic";
export default function PetChatPage() {
  const { petId } = useParams<{ petId: string }>();
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user?.uid || null);
  const { messages, loading, error, sendMessage } = useChat(petId);
  const { pets } = usePets();
  const currentPet = pets.find((pet) => pet.id === petId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!userProfile?.nickname) {
      toast.error(
        "プロフィール名が設定されていません。設定ページで設定してください。"
      );
      return;
    }

    await sendMessage(
      newMessage,
      userProfile.nickname,
      userProfile.profileImageUrl
    );
    setNewMessage("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">チャットを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">このページを表示するにはログインが必要です。</p>
        <Link href="/login">
          <Button>ログインページへ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {currentPet ? `${currentPet.name} とのチャット` : "ペットチャット"}
        </h1>
        <Link href="/pets">
          <Button variant="outline">ペット一覧へ戻る</Button>
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            まだメッセージはありません。
          </div>
        ) : (
          messages.map((msg, index) => {
            const prevMsg = messages[index - 1];
            const prevDate = prevMsg && prevMsg.timestamp
              ? format(prevMsg.timestamp.toDate(), "yyyy-MM-dd")
              : null;
            const currentDate = msg.timestamp
              ? format(msg.timestamp.toDate(), "yyyy-MM-dd")
              : null;
            const showDate = prevDate !== currentDate;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center text-gray-400 text-xs my-2">
                    {msg.timestamp ? format(msg.timestamp.toDate(), "yyyy年MM月dd日 (E)", {
                      locale: ja,
                    }) : 'Invalid Date'}
                  </div>
                )}
                <div
                  className={`flex gap-3 ${
                    msg.senderId === user?.uid ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.senderId !== user?.uid && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={msg.senderProfileImageUrl}
                        alt={msg.senderName}
                      />
                      <AvatarFallback>
                        {msg.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}

<div className={`flex flex-col max-w-[70%] ${msg.senderId === user?.uid ? "items-end" : "items-start"}`}>
  {msg.senderId !== user?.uid && (
    <div className="text-xs text-gray-500 mb-1 text-left">{msg.senderName}</div>
  )}

  <div className={`flex items-end gap-1 ${msg.senderId === user?.uid ? "flex-row-reverse" : "flex-row"}`}>
    <div
      className={`p-3 rounded-lg break-words ${
        msg.senderId === user?.uid
          ? "bg-blue-500 text-white rounded-br-none"
          : "bg-gray-200 text-gray-800 rounded-bl-none"
      }`}
    >
      <p className="text-sm break-words whitespace-pre-wrap">{msg.messageText}</p>
    </div>
    <span className="text-[10px] text-gray-500 whitespace-nowrap">
      {msg.timestamp ? format(msg.timestamp.toDate(), "HH:mm", { locale: ja }) : ""}
    </span>
  </div>
</div>

                  {msg.senderId === user?.uid && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={msg.senderProfileImageUrl}
                        alt={msg.senderName}
                      />
                      <AvatarFallback>
                        {msg.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 flex items-center gap-2 shadow-md">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 min-h-[40px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows={1}
        />
        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
          <Send className="h-5 w-5" />
          <span className="sr-only">送信</span>
        </Button>
      </div>
    </div>
  );
}
