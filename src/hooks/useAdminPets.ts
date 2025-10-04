import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Pet } from './usePets'; // Re-use the Pet interface

export const useAdminPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const petsCollectionRef = collection(db, 'dogs');
    const q = query(petsCollectionRef); // Query all pets

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPets: Pet[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Pet, 'id'>),
      }));
      setPets(fetchedPets);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching all pets for admin:", err);
      setError(err);
      setLoading(false);
      toast.error("すべてのペットの取得に失敗しました。");
    });

    return () => unsubscribe();
  }, []);

  const updatePetAdmin = useCallback(async (petId: string, petData: Partial<Omit<Pet, 'id'>>) => {
    setLoading(true);
    setError(null);
    try {
      const petRef = doc(db, 'dogs', petId);
      await updateDoc(petRef, petData);
      toast.success("ペット情報を更新しました (Admin)。");
    } catch (err: unknown) {
      console.error("Error updating pet (Admin):", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`ペット情報の更新に失敗しました (Admin): ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePetAdmin = useCallback(async (petId: string) => {
    setLoading(true);
    setError(null);
    try {
      const petRef = doc(db, 'dogs', petId);
      await deleteDoc(petRef); // Hard delete for admin
      toast.success("ペットを削除しました (Admin)。");
    } catch (err: unknown) {
      console.error("Error deleting pet (Admin):", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`ペットの削除に失敗しました (Admin): ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pets, loading, error, updatePetAdmin, deletePetAdmin };
};
