'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const processSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setLoading(true);
        let emailFromStorage = window.localStorage.getItem('emailForSignIn');
        if (!emailFromStorage) {
          emailFromStorage = window.prompt('確認のため、メールアドレスを再度入力してください。');
        }

        if (emailFromStorage) {
          try {
            // Check if a user is already logged in anonymously
            if (auth.currentUser && auth.currentUser.isAnonymous) {
              const credential = EmailAuthProvider.credentialWithLink(emailFromStorage, window.location.href);
              await linkWithCredential(auth.currentUser, credential);
              toast.success("アカウントを連携しました！");
            } else {
              await signInWithEmailLink(auth, emailFromStorage, window.location.href);
              toast.success('ログインしました！');
            }
            window.localStorage.removeItem('emailForSignIn');
            router.push('/');
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "不明なエラー";
            setError(errorMessage);
            if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'auth/credential-already-in-use') {
                toast.error('このメールアドレスは既に使用されています。');
            } else {
                toast.error(`ログインに失敗しました: ${errorMessage}`);
            }
            setLoading(false);
          }
        } else {
            toast.error('メールアドレスが確認できませんでした。');
            setLoading(false);
        }
      }
    };
    processSignIn();
  }, [router]);


  const handleEmailLogin = async () => {
    setError(null);
    setLoading(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast.success(`${email} にログインリンクを送信しました。メールを確認してください。`);
      setEmail("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(errorMessage);
      console.error(err);
      toast.error(`ログインリンクの送信に失敗しました: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Check if a user is already logged in anonymously
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        await linkWithPopup(auth.currentUser, provider);
        console.log("Anonymous account successfully linked with Google!");
        toast.success("アカウントを連携しました！");
      } else {
        await signInWithPopup(auth, provider);
        console.log("Logged in with Google successfully!");
      }
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(errorMessage);
      console.error(err);
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'auth/credential-already-in-use') {
        toast.error('このGoogleアカウントは既に使用されています。');
      } else {
        toast.error(`Googleでの処理に失敗しました: ${errorMessage}`);
      }
    } finally {
        setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
      console.log("Logged in anonymously successfully!");
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(errorMessage);
      console.error(err);
      toast.error(`ゲストログインに失敗しました: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            メールアドレスを入力してログインリンクを受け取ってください。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleEmailLogin} disabled={loading}>
            {loading ? '送信中...' : 'ログインリンクを送信'}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            Googleでログイン
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleAnonymousLogin} disabled={loading}>
            ゲストとして試す
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
