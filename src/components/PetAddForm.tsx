"use client";

import { useState, useEffect } from "react";
import { usePets, Pet, VetInfo } from "@/hooks/usePets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Loader2 } from 'lucide-react';

interface PetAddFormProps {
  isOpen?: boolean; // Optional for when used as a standalone trigger
  onClose?: () => void;
  petToEdit?: Pet | null;
}

export function PetAddForm({
  isOpen: propIsOpen,
  onClose: propOnClose,
  petToEdit,
}: PetAddFormProps) {
  const { addPet, updatePet } = usePets();
  const [formData, setFormData] = useState<Omit<Pet, "id">>({
    name: "",
    breed: "",
    birthday: "",
    gender: "other",
    adoptionDate: "",
    medicalNotes: "",
    profileImageUrl: "",
    microchipId: "",
    vetInfo: [], // Initialize as empty array
  });
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isModalOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const closeModal =
    propOnClose !== undefined ? propOnClose : () => setInternalIsOpen(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      if (petToEdit) {
        setFormData({
          name: petToEdit.name || "",
          breed: petToEdit.breed || "",
          birthday: petToEdit.birthday || "",
          gender: petToEdit.gender || "other",
          adoptionDate: petToEdit.adoptionDate || "",
          medicalNotes: petToEdit.medicalNotes || "",
          profileImageUrl: petToEdit.profileImageUrl || "",
          microchipId: petToEdit.microchipId || "",
          vetInfo: petToEdit.vetInfo || [],
        });
      } else {
        setFormData({
          name: "",
          breed: "",
          birthday: "",
          gender: "other",
          adoptionDate: "",
          medicalNotes: "",
          profileImageUrl: "",
          microchipId: "",
          vetInfo: [],
        });
      }
    }
  }, [isModalOpen, petToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVetInfoChange = (index: number, field: keyof VetInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      vetInfo: prev.vetInfo?.map((vet, i) =>
        i === index ? { ...vet, [field]: value } : vet
      ) || [],
    }));
  };

  const handleAddVetInfo = () => {
    if (formData.vetInfo && formData.vetInfo.length < 5) {
      setFormData(prev => ({
        ...prev,
        vetInfo: [...(prev.vetInfo || []), { id: generateUniqueId(), name: '', phone: '' }],
      }));
    }
  };

  const handleRemoveVetInfo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      vetInfo: prev.vetInfo?.filter(vet => vet.id !== id) || [],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert("ペットの名前は必須です。");
      return;
    }
    setIsSubmitting(true);
    try {
      if (petToEdit) {
        await updatePet(petToEdit.id, formData);
        alert("ペット情報を更新しました！");
      } else {
        await addPet(formData);
        alert("新しいペットを追加しました！");
      }
      closeModal(); // Close dialog on success
      // Reset form if adding new pet
      if (!petToEdit) {
        setFormData({
          name: "",
          breed: "",
          birthday: "",
          gender: "other",
          adoptionDate: "",
          medicalNotes: "",
        });
      }
    } catch (error) {
      console.error(error);
      alert("ペット情報の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
        else setInternalIsOpen(true);
      }}
    >
      <DialogTrigger asChild>
        {!petToEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInternalIsOpen(true)}
          >
            <PlusIcon className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {petToEdit ? "ペット情報を編集" : "新しいペットを追加"}
          </DialogTitle>
          <DialogDescription>
            ペットの情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">
              名前 *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="breed">
                種類
              </Label>
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="gender">
                性別
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange("gender", value)}
                value={formData.gender}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="性別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男の子</SelectItem>
                  <SelectItem value="female">女の子</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthday">
                誕生日
              </Label>
              <Input
                id="birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="adoptionDate">
                お迎え日
              </Label>
              <Input
                id="adoptionDate"
                name="adoptionDate"
                type="date"
                value={formData.adoptionDate}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="medicalNotes">
              メモ
            </Label>
            <Textarea
              id="medicalNotes"
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              className="w-full"
              placeholder="健康に関するメモなど"
            />
          </div>
          <div>
            <Label htmlFor="profileImageUrl">
              プロフィール画像URL
            </Label>
            <Input
              id="profileImageUrl"
              name="profileImageUrl"
              value={formData.profileImageUrl}
              onChange={handleChange}
              className="w-full"
              placeholder="画像URL"
            />
          </div>
          <div>
            <Label htmlFor="microchipId">マイクロチップID</Label>
            <Input id="microchipId" name="microchipId" value={formData.microchipId} onChange={handleChange} className="w-full" placeholder="マイクロチップID" />
          </div>

          <div className="col-span-4 space-y-2 my-4">
            <Label>かかりつけ医情報 (最大5件)</Label>
            {formData.vetInfo && formData.vetInfo.map((vet, index) => (
              <div key={vet.id} className="space-y-2 border p-2 rounded">
                <div>
                  <Label htmlFor={`vetName-${index}`}>名前</Label>
                  <Input
                    id={`vetName-${index}`}
                    name="name"
                    value={vet.name || ''}
                    onChange={(e) => handleVetInfoChange(index, 'name', e.target.value)}
                    className="w-full"
                    placeholder="病院名または医師名"
                  />
                </div>
                <div>
                  <Label htmlFor={`vetPhone-${index}`}>電話番号</Label>
                  <Input
                    id={`vetPhone-${index}`}
                    name="phone"
                    value={vet.phone || ''}
                    onChange={(e) => handleVetInfoChange(index, 'phone', e.target.value)}
                    className="w-full"
                    placeholder="電話番号"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveVetInfo(vet.id)}
                  className="w-full"
                >
                  削除
                </Button>
              </div>
            ))}
            {formData.vetInfo && formData.vetInfo.length < 5 && (
              <Button type="button" variant="outline" onClick={handleAddVetInfo} className="w-full">
                かかりつけ医を追加
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={closeModal} variant="outline">キャンセル</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '保存'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function generateUniqueId() {
  return Date.now().toString();
}
