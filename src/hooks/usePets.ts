'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  collectionGroup,
  getDoc,
  setDoc,
  Timestamp,
  writeBatch,
  FieldValue,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ペットの獣医情報
export interface VetInfo {
  id: string;
  name?: string;
  phone?: string;
}

// ペットデータ型定義
export interface Pet {
  id: string;
  name: string;
  breed?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  adoptionDate?: string;
  profileImageUrl?: string;
  microchipId?: string;
  medicalNotes?: string;
  vetInfo?: VetInfo[];
  deleted?: boolean; // 論理削除フラグ
  deletedAt?: Timestamp | null; // 削除日時
}

// 共有メンバーのデータ型定義
export interface Member {
  id: string; // documentId which is userId
  role: 'owner' | 'general' | 'viewer';
  status: 'pending' | 'active' | 'removed' | 'declined';
  uid: string;
  inviteEmail: string;
  invitedBy?: string;
  invitedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 保留中の招待データ型定義
export interface PendingInvitation {
  pet: Pet;
  memberId: string;
}

export const usePets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const petListenersRef = useRef<(() => void)[]>([]); // 個別ペットリスナーの解除関数を保持

  useEffect(() => {
    if (!user) {
      setPets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 既存の個別ペットリスナーを全て解除
    petListenersRef.current.forEach(unsubscribe => unsubscribe());
    petListenersRef.current = [];

    // ユーザーがメンバーとして登録されているペットのIDを取得するリスナー
    const membersQuery = query(
      collectionGroup(db, 'members'),
      where('uid', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsubscribeMembers = onSnapshot(membersQuery, async (membersSnapshot) => {
      const petIds = membersSnapshot.docs.map(memberDoc => memberDoc.ref.parent.parent!.id);
      const uniquePetIds = Array.from(new Set(petIds));

      // 既存の個別ペットリスナーを全て解除
      petListenersRef.current.forEach(unsubscribe => unsubscribe());
      petListenersRef.current = [];

      if (uniquePetIds.length === 0) {
        setPets([]);
        setLoading(false);
        return;
      }

      const currentPetsMap = new Map<string, Pet>();
      const initialFetches: Promise<void>[] = []; // To track initial data load

      uniquePetIds.forEach(petId => {
        const petDocRef = doc(db, 'dogs', petId);
        const unsubscribePet = onSnapshot(petDocRef, (petSnapshot) => {
          if (petSnapshot.exists() && !petSnapshot.data()?.deleted) {
            currentPetsMap.set(petId, { id: petSnapshot.id, ...(petSnapshot.data() as Omit<Pet, 'id'>) });
          } else {
            currentPetsMap.delete(petId);
          }
          setPets(Array.from(currentPetsMap.values())); // Update pets whenever any pet changes
        }, (error) => {
          console.error(`usePets: ペット ${petId} の取得に失敗しました:`, error);
          setPets(Array.from(currentPetsMap.values())); // Still update with available pets
        });
        petListenersRef.current.push(unsubscribePet);
        initialFetches.push(new Promise(resolve => {
          // Resolve after the first snapshot for this pet
          const tempUnsubscribe = onSnapshot(petDocRef, () => {
            tempUnsubscribe(); // Unsubscribe after first data
            resolve();
          });
        }));
      });

      // Wait for all initial pet data to be loaded
      await Promise.all(initialFetches);
      setLoading(false); // All initial data loaded

    }, (error) => {
      console.error('usePets: メンバーシップの取得に失敗しました:', error);
      setLoading(false);
    });

    // クリーンアップ関数
    return () => {
      unsubscribeMembers();
      petListenersRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  // 新しいペットを追加する関数
  const addPet = async (petData: Omit<Pet, 'id'>) => {
    if (!user) {
      toast.error('ログインが必要です。');
      return;
    }
    try {
      // `dogs`コレクションに新しいペットドキュメントを追加
      const newPetRef = await addDoc(collection(db, 'dogs'), {
        ...petData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // `members`サブコレクションに飼い主（オーナー）を追加
      await addDoc(collection(db, 'dogs', newPetRef.id, 'members'), {
        uid: user.uid,
        inviteEmail: user.email,
        role: 'owner',
        status: 'active',
        invitedBy: user.uid, // Set the creator as the inviter
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newPetRef.id;
    } catch (error) {
      console.error('ペットの追加に失敗しました:', error);
      toast.error('ペットの追加に失敗しました。');
    }
  };

  // ペット情報を更新する関数
  const updatePet = async (petId: string, petData: Partial<Omit<Pet, 'id'>>) => {
    if (!user) {
      toast.error('ログインが必要です。');
      return;
    }
    try {
      await updateDoc(doc(db, 'dogs', petId), {
        ...petData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('usePets: ペットの更新に失敗しました:', error);
      toast.error('ペットの更新に失敗しました。');
    }
  };

  // ペットを削除する関数
  const deletePet = async (petId: string) => {
    if (!user) {
      toast.error('ログインが必要です。');
      return;
    }
    try {
      const batch = writeBatch(db);
      const petRef = doc(db, 'dogs', petId);

      // 論理削除フラグを設定
      batch.update(petRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 関連するタスクを論理削除
      const tasksRef = collection(db, 'dogs', petId, 'tasks');
      const taskDocs = await getDocs(tasksRef);
      taskDocs.docs.forEach(d => {
        batch.update(d.ref, {
          deleted: true,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      // 関連するログを論理削除
      const logsRef = collection(db, 'dogs', petId, 'logs');
      const logDocs = await getDocs(logsRef);
      logDocs.docs.forEach(d => {
        batch.update(d.ref, {
          deleted: true,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      toast.success('ペットと関連データが論理削除されました。');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error('usePets: ペットの論理削除に失敗しました:', errorMessage);
      toast.error('ペットの論理削除に失敗しました。');
    }
  };

  // 共有メンバーを取得する関数
  const getSharedMembers = useCallback((petId: string, onMembersUpdate: (members: Member[]) => void) => {
    if (!user) {
      onMembersUpdate([]);
      return () => {};
    }
    const membersCollection = collection(db, 'dogs', petId, 'members');
    const unsubscribe = onSnapshot(membersCollection, (snapshot) => {
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, 'id'>),
      }));
      onMembersUpdate(members);
    }, (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error('共有メンバーの取得に失敗しました:', errorMessage);
      onMembersUpdate([]);
    });
    return unsubscribe;
  }, [user]);

  // メンバーを招待する関数
  const inviteMember = async (petId: string, email: string) => {
    if (!user) {
      toast.error('ログインが必要です。');
      throw new Error('ログインが必要です。');
    }
    try {
      const membersCollection = collection(db, 'dogs', petId, 'members');
      // TODO: 招待する前に、既にメンバーでないか、招待中でないかを確認する
      // TODO: 招待される側のUIDが不明なため、document IDは自動生成させる
      await addDoc(membersCollection, {
        inviteEmail: email,
        invitedBy: user.uid,
        role: 'viewer',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        invitedAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error('メンバーの招待に失敗しました:', errorMessage);
      toast.error('メンバーの招待に失敗しました。');
      throw new Error('メンバーの招待に失敗しました。');
    }
  };

  // 保留中の招待を取得する関数
  const getPendingInvitations = useCallback((onInvitationsUpdate: (invitations: PendingInvitation[]) => void) => {
    if (!user || !user.email) {
      onInvitationsUpdate([]);
      return () => {};
    }
    const q = query(
      collectionGroup(db, 'members'),
      where('inviteEmail', '==', user.email),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const invitations = await Promise.all(snapshot.docs.map(async (memberDoc) => {
        const petDocRef = memberDoc.ref.parent.parent;
        if (!petDocRef) return null;
        const petDoc = await getDoc(petDocRef);
        if (!petDoc.exists()) return null;
        return {
          pet: { id: petDoc.id, ...petDoc.data() } as Pet,
          memberId: memberDoc.id,
        };
      }));
      onInvitationsUpdate(invitations.filter(inv => inv !== null) as PendingInvitation[]);
    }, (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error("保留中の招待の取得に失敗しました:", errorMessage);
      onInvitationsUpdate([]);
    });
    return unsubscribe;
  }, [user]);

  // 招待のステータスを更新する関数
  const updateInvitationStatus = useCallback(async (petId: string, memberId: string, newStatus: 'active' | 'declined' | 'removed') => {
    if (!user) {
      toast.error('ログインが必要です。');
      throw new Error('ログインが必要です。');
    }
    try {
      const memberDocRef = doc(db, 'dogs', petId, 'members', memberId);
      const dataToUpdate: { 
        status: 'active' | 'declined' | 'removed';
        updatedAt: FieldValue;
        uid?: string;
      } = { 
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'active') {
        dataToUpdate.uid = user.uid; // Add UID of the user who accepted
      }

      await updateDoc(memberDocRef, dataToUpdate);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error('招待ステータスの更新に失敗しました:', errorMessage);
      toast.error('招待ステータスの更新に失敗しました。');
      throw new Error('招待ステータスの更新に失敗しました。');
    }
  }, [user]);

  // 共有メンバーを削除する関数
  const removeMember = useCallback(async (petId: string, memberId: string) => {
    if (!user) {
      toast.error('ログインが必要です。');
      throw new Error('ログインが必要です。');
    }
    try {
      const memberDocRef = doc(db, 'dogs', petId, 'members', memberId);
      await deleteDoc(memberDocRef);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      console.error('メンバーの削除に失敗しました:', errorMessage);
      toast.error('メンバーの削除に失敗しました。');
      throw new Error('メンバーの削除に失敗しました。');
    }
  }, [user]);

  return { pets, loading, addPet, updatePet, deletePet, getSharedMembers, inviteMember, getPendingInvitations, updateInvitationStatus, removeMember };
};
