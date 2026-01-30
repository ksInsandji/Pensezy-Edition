"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { User, Pencil, Loader2, Camera, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileEditFormProps {
  userId: string;
  initialData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    avatarUrl: string | null;
  };
}

export function ProfileEditForm({ userId, initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profil mis a jour",
        description: "Vos informations ont ete enregistrees.",
      });

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre a jour le profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Upload to avatars bucket
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setFormData({ ...formData, avatarUrl: publicUrlData.publicUrl });
      toast({
        title: "Photo mise a jour",
        description: "Votre photo de profil a ete changee.",
      });

      router.refresh();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de changer la photo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  return (
    <div>
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {formData.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={formData.avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
          ) : (
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-3xl border-4 border-primary/20">
              {formData.fullName?.charAt(0).toUpperCase() || formData.email?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Camera button for upload */}
          <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="sr-only"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nom complet</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Votre nom"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">L&apos;email ne peut pas etre modifie</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Telephone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+225 XX XX XX XX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Adresse</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Votre adresse de livraison"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">{formData.fullName || "Utilisateur"}</h2>
          <p className="text-sm text-muted-foreground mb-2">{formData.email}</p>

          {formData.phone && (
            <p className="text-sm text-muted-foreground">{formData.phone}</p>
          )}
          {formData.address && (
            <p className="text-sm text-muted-foreground">{formData.address}</p>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="mt-4"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Modifier le profil
          </Button>
        </div>
      )}
    </div>
  );
}
