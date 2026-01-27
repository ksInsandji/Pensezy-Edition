import { ShieldCheck, BookOpen, Truck, Smartphone } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-stone-950">
      {/* Hero */}
      <div className="relative bg-blue-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
            Notre Mission
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100 max-w-2xl mx-auto">
            Démocratiser l'accès à la culture au Cameroun et en Afrique grâce à une plateforme hybride innovante.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 items-start">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl mb-6">
                    Pensezy Edition, c'est quoi ?
                </h2>
                <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg">
                    <p>
                        Née du constat que l'accès au livre est souvent difficile (logistique, coût, disponibilité), Pensezy Edition se positionne comme le pont entre les auteurs et les lecteurs.
                    </p>
                    <p>
                        Notre particularité ? <strong className="text-blue-900 dark:text-blue-400">Le modèle Hybride.</strong> Nous ne vous forçons pas à choisir. Vous aimez l'odeur du papier ? Commandez le livre physique. Vous préférez lire sur votre téléphone dans le taxi ? Optez pour l'ebook à moindre coût.
                    </p>
                    <p>
                        Pour les auteurs, nous offrons une protection sans précédent contre le piratage grâce à notre liseuse sécurisée qui empêche le téléchargement illégal des fichiers.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <BookOpen className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Large Catalogue</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Des manuels scolaires aux romans, en passant par les essais.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Smartphone className="h-8 w-8 text-orange-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Paiement Mobile</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Payez avec vos méthodes habituelles (OM, MOMO).</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="h-8 w-8 text-green-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Sécurité</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Vos données et vos achats sont protégés.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Truck className="h-8 w-8 text-purple-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Livraison</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Expédition rapide partout au pays.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
