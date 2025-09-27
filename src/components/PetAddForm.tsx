'use client';

import { useState, useEffect } from 'react';
import { usePets, Pet } from '@/hooks/usePets';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PetAddFormProps {
  isOpen?: boolean; // Optional for when used as a standalone trigger
  onClose?: () => void;
  petToEdit?: Pet | null;
}

export function PetAddForm({ isOpen: propIsOpen, onClose: propOnClose, petToEdit }: PetAddFormProps) {
  const { addPet, updatePet } = usePets();
  const [formData, setFormData] = useState<Omit<Pet, 'id'>>({
    name: '',
    breed: '',
    birthday: '',
    gender: 'other',
    adoptionDate: '',
    medicalNotes: '',
  });
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isModalOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const closeModal = propOnClose !== undefined ? propOnClose : () => setInternalIsOpen(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      if (petToEdit) {
        setFormData({
          name: petToEdit.name || '',
          breed: petToEdit.breed || '',
          birthday: petToEdit.birthday || '',
          gender: petToEdit.gender || 'other',
          adoptionDate: petToEdit.adoptionDate || '',
          medicalNotes: petToEdit.medicalNotes || '',
        });
      } else {
        setFormData({ name: '', breed: '', birthday: '', gender: 'other', adoptionDate: '', medicalNotes: '' });
      }
    }
  }, [isModalOpen, petToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('ペットの名前は必須です。');
      return;
    }
    setIsSubmitting(true);
    try {
      if (petToEdit) {
        await updatePet(petToEdit.id, formData);
        alert('ペット情報を更新しました！');
      } else {
        await addPet(formData);
        alert('新しいペットを追加しました！');
      }
      closeModal(); // Close dialog on success
      // Reset form if adding new pet
      if (!petToEdit) {
        setFormData({ name: '', breed: '', birthday: '', gender: 'other', adoptionDate: '', medicalNotes: '' });
      }
    } catch (error) {
      console.error(error);
      alert('ペット情報の保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); else setInternalIsOpen(true); }}>
      <DialogTrigger asChild>
        {!petToEdit && <Button onClick={() => setInternalIsOpen(true)}>新しいペットを追加</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{petToEdit ? 'ペット情報を編集' : '新しいペットを追加'}</DialogTitle>
          <DialogDescription>
            ペットの情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">名前 *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breed" className="text-right">種類</Label>
            <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">性別</Label>
            <Select onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="性別を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男の子</SelectItem>
                <SelectItem value="female">女の子</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthday" className="text-right">誕生日</Label>
            <Input id="birthday" name="birthday" type="date" value={formData.birthday} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="adoptionDate" className="text-right">お迎え日</Label>
            <Input id="adoptionDate" name="adoptionDate" type="date" value={formData.adoptionDate} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="medicalNotes" className="text-right">メモ</Label>
            <Textarea id="medicalNotes" name="medicalNotes" value={formData.medicalNotes} onChange={handleChange} className="col-span-3" placeholder="健康に関するメモなど" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={closeModal} variant="outline">キャンセル</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
