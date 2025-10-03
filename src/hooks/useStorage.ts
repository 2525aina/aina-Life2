'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useStorage = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!user) {
        const authError = new Error('User is not authenticated.');
        setError(authError);
        reject(authError);
        return;
      }

      if (!file) {
        const fileError = new Error('No file provided.');
        setError(fileError);
        reject(fileError);
        return;
      }

      const storageRef = ref(storage, `images/${user.uid}/${Date.now()}_${file.name}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploading(true);
      setError(null);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Image upload failed:", error);
          setError(error);
          setUploading(false);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setUploading(false);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  return { uploadImage, uploading, progress, error };
};
