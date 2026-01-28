"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MoreVertical, UserCog, Trash2, Loader2 } from "lucide-react";
import { updateUserRole, deleteUser } from "../actions";

interface UserActionsProps {
  userId: string;
  currentRole: string;
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRoleChange = async (newRole: "user" | "seller" | "admin") => {
    if (newRole === currentRole) return;

    setIsLoading(true);
    try {
      const result = await updateUserRole(userId, newRole);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Role mis a jour",
          description: `L'utilisateur est maintenant ${
            newRole === "admin" ? "administrateur" : newRole === "seller" ? "vendeur" : "lecteur"
          }.`,
        });
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irreversible.")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteUser(userId);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Utilisateur supprime",
          description: "L'utilisateur a ete supprime avec succes.",
        });
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreVertical className="w-4 h-4" />
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
              Changer le role
            </div>
            <button
              onClick={() => handleRoleChange("user")}
              disabled={currentRole === "user"}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 ${
                currentRole === "user" ? "bg-green-50 text-green-700" : "text-foreground"
              }`}
            >
              Lecteur
            </button>
            <button
              onClick={() => handleRoleChange("seller")}
              disabled={currentRole === "seller"}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 ${
                currentRole === "seller" ? "bg-purple-50 text-purple-700" : "text-foreground"
              }`}
            >
              Vendeur
            </button>
            <button
              onClick={() => handleRoleChange("admin")}
              disabled={currentRole === "admin"}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 ${
                currentRole === "admin" ? "bg-red-50 text-red-700" : "text-foreground"
              }`}
            >
              Administrateur
            </button>

            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={handleDelete}
                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
