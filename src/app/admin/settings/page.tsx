import { Card } from "@/components/ui/card";
import {
  Settings,
  Percent,
  CreditCard,
  Bell,
  Shield,
  Globe,
  Mail,
  Smartphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Ces valeurs seraient normalement stockees en base de donnees
  const platformSettings = {
    commission: 15, // Pourcentage de commission
    minWithdrawal: 5000, // Montant minimum de retrait en FCFA
    currency: "XAF", // Devise
    platformName: "Pensezy Edition",
    supportEmail: "support@pensezy.com",
    paymentProvider: "CinetPay",
  };

  const settingsSections = [
    {
      title: "Commission plateforme",
      description: "Pourcentage preleve sur chaque vente",
      icon: Percent,
      value: `${platformSettings.commission}%`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Retrait minimum",
      description: "Montant minimum pour effectuer un retrait",
      icon: CreditCard,
      value: `${platformSettings.minWithdrawal.toLocaleString()} FCFA`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Devise",
      description: "Devise utilisee sur la plateforme",
      icon: Globe,
      value: platformSettings.currency,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Provider de paiement",
      description: "Service de paiement integre",
      icon: Smartphone,
      value: platformSettings.paymentProvider,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parametres</h1>
        <p className="text-muted-foreground">
          Configuration de la plateforme Pensezy Edition
        </p>
      </div>

      {/* Platform Info */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{platformSettings.platformName}</h2>
            <p className="text-muted-foreground">Plateforme de livres africains</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
            >
              <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                <section.icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{section.title}</p>
                <p className="text-lg font-semibold text-foreground">{section.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Contact & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Contact</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email support</span>
              <span className="text-foreground">{platformSettings.supportEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Site web</span>
              <span className="text-foreground">pensezy.com</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nouvelles commandes</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Actif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Demandes de retrait</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Actif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nouveaux produits</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Actif</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Securite</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Authentification</p>
            <p className="font-medium text-foreground">Supabase Auth</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Stockage fichiers</p>
            <p className="font-medium text-foreground">Supabase Storage</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Protection PDF</p>
            <p className="font-medium text-foreground">Watermark + Streaming</p>
          </div>
        </div>
      </Card>

      {/* Note */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> La modification des parametres sera disponible dans une prochaine mise a jour.
          Contactez le support technique pour toute modification urgente.
        </p>
      </div>
    </div>
  );
}
