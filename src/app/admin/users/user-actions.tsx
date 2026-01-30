"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, User, Store, Shield, Trash2, Loader2 } from "lucide-react";
import { updateUserRole, deleteUser } from "../actions";

interface UserActionsProps {
  userId: string;
  currentRole: string;
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
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
    }
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Changer le role</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => handleRoleChange("user")}
            disabled={currentRole === "user"}
            className={currentRole === "user" ? "bg-green-50" : ""}
          >
            <User className="w-4 h-4 mr-2 text-green-600" />
            <span className={currentRole === "user" ? "text-green-700 font-medium" : ""}>
              Lecteur
            </span>
            {currentRole === "user" && (
              <span className="ml-auto text-xs text-green-600">Actuel</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleRoleChange("seller")}
            disabled={currentRole === "seller"}
            className={currentRole === "seller" ? "bg-purple-50" : ""}
          >
            <Store className="w-4 h-4 mr-2 text-purple-600" />
            <span className={currentRole === "seller" ? "text-purple-700 font-medium" : ""}>
              Vendeur
            </span>
            {currentRole === "seller" && (
              <span className="ml-auto text-xs text-purple-600">Actuel</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleRoleChange("admin")}
            disabled={currentRole === "admin"}
            className={currentRole === "admin" ? "bg-red-50" : ""}
          >
            <Shield className="w-4 h-4 mr-2 text-red-600" />
            <span className={currentRole === "admin" ? "text-red-700 font-medium" : ""}>
              Administrateur
            </span>
            {currentRole === "admin" && (
              <span className="ml-auto text-xs text-red-600">Actuel</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
