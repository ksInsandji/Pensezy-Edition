"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Smartphone,
  Shield,
  Zap,
  ArrowRight,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Features data
const FEATURES = [
  {
    icon: BookOpen,
    title: "Lecture en streaming",
    description: "Accédez à vos livres instantanément depuis n'importe quel appareil.",
  },
  {
    icon: Shield,
    title: "Contenu protégé",
    description: "Filigrane personnalisé et protection anti-copie pour les auteurs.",
  },
  {
    icon: Smartphone,
    title: "Physique & Numérique",
    description: "Choisissez votre format préféré ou optez pour les deux.",
  },
  {
    icon: Zap,
    title: "Paiement Mobile",
    description: "Payez facilement via MTN MoMo, Orange Money ou carte bancaire.",
  },
];

// Sample books
const FEATURED_BOOKS = [
  {
    id: "1",
    title: "L'Aventure Ambiguë",
    author: "Cheikh Hamidou Kane",
    price: 4500,
    type: "digital",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Petit Pays",
    author: "Gaël Faye",
    price: 6000,
    type: "physical",
    rating: 4.9,
  },
  {
    id: "3",
    title: "Une si longue lettre",
    author: "Mariama Bâ",
    price: 3500,
    type: "digital",
    rating: 4.7,
  },
  {
    id: "4",
    title: "Les Soleils des Indépendances",
    author: "Ahmadou Kourouma",
    price: 5000,
    type: "physical",
    rating: 4.6,
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    id: 1,
    name: "Amina S.",
    role: "Étudiante, Yaoundé",
    text: "Pouvoir lire mes cours en streaming dans le bus et recevoir le livre papier pour réviser, c'est exactement ce qu'il me fallait.",
    avatar: "A",
  },
  {
    id: 2,
    name: "Marc T.",
    role: "Auteur indépendant",
    text: "Enfin une plateforme qui protège mes œuvres contre le piratage tout en me payant rapidement via Mobile Money.",
    avatar: "M",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative container-wrapper section-padding">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Plateforme de lecture africaine
              </span>

              <h1 className="heading-1 text-foreground mb-6">
                Lisez sans limite,{" "}
                <span className="text-gradient">achetez en confiance.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Découvrez des milliers de livres africains en version numérique ou physique.
                Lecture sécurisée, paiement simple, livraison rapide.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-xl mx-auto"
            >
              <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-2xl shadow-lg">
                <Search className="h-5 w-5 text-muted-foreground ml-3" />
                <Input
                  placeholder="Rechercher un livre, un auteur..."
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-base"
                />
                <Link href="/marketplace">
                  <Button className="bg-primary hover:bg-primary/90 rounded-xl px-6">
                    Rechercher
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 pt-8"
            >
              {[
                { value: "5000+", label: "Livres" },
                { value: "500+", label: "Auteurs" },
                { value: "10k+", label: "Lecteurs" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wrapper">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="p-6 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="section-padding">
        <div className="container-wrapper">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="heading-2 text-foreground mb-2">Livres populaires</h2>
              <p className="text-muted-foreground">
                Les ouvrages les plus appréciés par notre communauté
              </p>
            </div>
            <Link href="/marketplace">
              <Button variant="ghost" className="gap-2">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURED_BOOKS.map((book) => (
              <motion.div
                key={book.id}
                variants={fadeInUp}
                className="group"
              >
                <Link href={`/marketplace/${book.id}`}>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden card-hover">
                    {/* Book Cover Placeholder */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/30" />
                      {/* Type Badge */}
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                          book.type === "digital"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {book.type === "digital" ? "Numérique" : "Physique"}
                      </span>
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{book.author}</p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          {book.price.toLocaleString()} FCFA
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          {book.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wrapper">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Comment ça marche ?</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              En quelques étapes simples, accédez à votre prochaine lecture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Choisissez",
                description: "Parcourez notre catalogue et trouvez votre prochain livre",
              },
              {
                step: "2",
                title: "Payez",
                description: "Réglez facilement via Mobile Money ou carte bancaire",
              },
              {
                step: "3",
                title: "Lisez",
                description: "Accédez instantanément en streaming ou recevez votre livre",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-primary-foreground/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-wrapper">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-foreground mb-4">
              Ce que disent nos utilisateurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 bg-card rounded-2xl border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container-wrapper text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 mb-4">Prêt à commencer ?</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Rejoignez des milliers de lecteurs et accédez à la plus grande bibliothèque
              numérique africaine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                  Créer un compte gratuit
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8"
                >
                  Explorer le catalogue
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container-wrapper">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/Logo_Pensezy_Edition.png"
                alt="Pensezy Edition"
                width={32}
                height={32}
              />
              <span className="text-muted-foreground">
                © 2026 Pensezy Edition. Yaoundé, Cameroun.
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                href="/help"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Aide
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
