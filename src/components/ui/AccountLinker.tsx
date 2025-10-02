'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithPopup,
  linkWithCredential,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AccountLinker() {
  const [isLinking, setIsLinking] = useState(false);
  const [emailForLink, setEmailForLink] = useState("");
  const router = useRouter();

  useEffect(() => {
    const completeEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href) && auth.currentUser?.isAnonymous) {
        setIsLinking(true);
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("確認のため、メールアドレスを再度入力してください。");
        }
        if (email && auth.currentUser) {
          try {
            const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
            window.history.replaceState({}, document.title, window.location.pathname);
            await linkWithCredential(auth.currentUser, credential);
            toast.success("メールアドレスを連携しました！");
            window.localStorage.removeItem("emailForSignIn");
            router.push('/profile');
          } catch (err) {
            const isFirebaseError = typeof err === 'object' && err !== null && 'code' in err;
            const message = err instanceof Error ? err.message : String(err);
            if (isFirebaseError && ((err as {code:string}).code === "auth/credential-already-in-use" || (err as {code:string}).code === "auth/email-already-in-use")) {
              toast.error("このメールアドレスアカウントが既に使用されています。登録されていないメールアドレスを使用してください。");
            } else {
              toast.error(`連携に失敗しました: ${message}`);
            }
          } finally {
            setIsLinking(false);
          }
        } else if (email) {
            toast.error("連携セッションが見つかりません。再度ゲストとしてログインしてからお試しください。");
            setIsLinking(false);
        }
      }
    };
    completeEmailLink();
  }, [router]);

  const handleLinkWithGoogle = async () => {
    if (!auth.currentUser) return;
    setIsLinking(true);
    const provider = new GoogleAuthProvider();
    try {
      await linkWithPopup(auth.currentUser, provider);
      toast.success("Googleアカウントを連携しました！");
      router.push('/profile');
    } catch (err) {
        const isFirebaseError = typeof err === 'object' && err !== null && 'code' in err;
        const message = err instanceof Error ? err.message : String(err);
      if (isFirebaseError && (err as {code:string}).code === "auth/credential-already-in-use") {
        toast.error("このGoogleアカウントは既に使用されています。登録されていないGoogleアカウントを使用してください。");
      } else {
        toast.error(`連携に失敗しました: ${message}`);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleSendEmailLink = async () => {
    if (!auth.currentUser) return;
    if (!emailForLink) {
      toast.error("メールアドレスを入力してください。");
      return;
    }
    if (!emailRegex.test(emailForLink)) {
      toast.error("有効なメールアドレスを入力してください。");
      return;
    }
    setIsLinking(true);
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, emailForLink, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", emailForLink);
      toast.success(`${emailForLink} に確認メールを送信しました。迷惑メールフォルダもご確認ください。`);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`メールの送信に失敗しました: ${message}`);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Card className="w-full max-w-md mb-6">
      <CardHeader>
        <CardTitle>アカウントを登録</CardTitle>
        <CardDescription>
          ゲストアカウントのデータを引き継ぐために、アカウントを連携してください。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email-link">メールアドレスで登録</Label>
          <div className="flex gap-2">
            <Input
              id="email-link"
              type="email"
              placeholder="m@example.com"
              value={emailForLink}
              onChange={(e) => setEmailForLink(e.target.value)}
              disabled={isLinking}
            />
            <Button onClick={handleSendEmailLink} disabled={isLinking}>
              {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : "リンクを送信"}
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              または
            </span>
          </div>
        </div>
        <div className="grid gap-2">
           <Label>Googleアカウントで登録</Label>
          <Button
            variant="outline"
            onClick={handleLinkWithGoogle}
            disabled={isLinking}
            className="w-full"
          >
            {isLinking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Googleアカウントと連携"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}