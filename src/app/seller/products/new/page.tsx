"use client";

import { createProductAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createProductAction(formData);
    setLoading(false);

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: typeof result.error === 'object' ? "Vérifiez les champs" : result.error
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mettre en vente un livre</h1>

      <Card className="p-6">
        <form action={handleSubmit} className="space-y-6">

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations du livre</h3>
            <Input name="title" label="Titre du livre" required placeholder="Ex: Père Riche Père Pauvre" />
            <Input name="author" label="Auteur" required placeholder="Ex: Robert Kiyosaki" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Détails de l'offre</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input name="price" label="Prix (FCFA)" type="number" min="0" required />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de produit</label>
                <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="physical">Livre Papier</option>
                  <option value="digital">Livre Numérique (Ebook)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">État (Si physique)</label>
                <select name="condition" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="new">Neuf</option>
                  <option value="like_new">Comme neuf</option>
                  <option value="good">Bon état</option>
                  <option value="acceptable">Acceptable</option>
                </select>
              </div>

              <Input name="stock" label="Stock disponible" type="number" min="1" defaultValue="1" />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-blue-900" loading={loading}>
              Publier l'annonce
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}
