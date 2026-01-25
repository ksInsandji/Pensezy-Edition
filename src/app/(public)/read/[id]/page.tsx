import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PdfViewer } from "@/components/reader/pdf-viewer";

type Props = {
  params: Promise<{ id: string }>
}

export default async function ReadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Check Library Access
  const { data: access, error: accessError } = await supabase
    .from("library_access")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", id)
    .single();

  if (accessError || !access) {
    // Pas d'accès ou erreur
    console.error("Access denied:", accessError);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow text-center">
                <h1 className="text-xl font-bold text-red-600 mb-2">Accès refusé</h1>
                <p className="text-gray-600">Vous ne possédez pas ce livre numérique.</p>
            </div>
        </div>
    );
  }

  // 2. Get File Path from Listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("file_path, type")
    .eq("id", id)
    .single();

  if (listingError || !listing || !listing.file_path) {
     return notFound();
  }

  if (listing.type !== 'digital') {
      return <div className="p-8 text-center">Ce produit n'est pas un livre numérique.</div>;
  }

  // 3. Generate Signed URL (valid 1 hour)
  const { data: signedUrlData, error: signError } = await supabase
    .storage
    .from("book_files")
    .createSignedUrl(listing.file_path, 3600);

  if (signError || !signedUrlData) {
    console.error("Sign URL error:", signError);
    return <div className="p-8 text-center">Erreur lors de la génération du lien sécurisé.</div>;
  }

  return (
    <PdfViewer
        url={signedUrlData.signedUrl}
        userEmail={user.email || "Utilisateur"}
    />
  );
}
