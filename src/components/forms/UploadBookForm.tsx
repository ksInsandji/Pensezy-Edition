import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle,
  ArrowRight,
  X,
  Pause,
  Play
} from 'lucide-react';

/**
 * Écran d'accueil animé pour MemoRIS
 * Affiche le logo, le slogan et une présentation des fonctionnalités
 * Avec contrôle pause/play
 */
const SplashScreen = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);

  // Configuration des slides
  const slides = [
    {
      icon: GraduationCap,
      title: 'MemoRIS',
      subtitle: 'École Normale Supérieure de Yaoundé',
      description: 'Système de gestion des encadrements de mémoires',
      color: 'from-blue-600 to-blue-800'
    },
    {
      icon: Users,
      title: 'Pour tous les acteurs',
      subtitle: 'Étudiants • Enseignants • Chefs de département',
      description: 'Une plateforme collaborative et transparente',
      color: 'from-indigo-600 to-purple-600'
    },
    {
      icon: BookOpen,
      title: 'Simple et efficace',
      subtitle: 'Choisissez vos encadreurs en 3 clics',
      description: 'Suivi en temps réel • Notifications instantanées',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CheckCircle,
      title: 'Gestion optimisée',
      subtitle: 'Affectation équitable et automatisée',
      description: 'Statistiques • Exports • Archivage',
      color: 'from-teal-600 to-blue-600'
    }
  ];

  const SLIDE_DURATION = 3000; // 3 secondes par slide
  const TOTAL_DURATION = slides.length * SLIDE_DURATION;

  // Gestion de la progression automatique
  useEffect(() => {
    if (isSkipped || isPaused) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / TOTAL_DURATION) * 100;
        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isSkipped, isPaused, onComplete]);

  // Changement automatique de slide
  useEffect(() => {
    if (isSkipped || isPaused) {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
      return;
    }

    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = prev + 1;
        if (next >= slides.length) {
          clearInterval(slideIntervalRef.current);
          return prev;
        }
        return next;
      });
    }, SLIDE_DURATION);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [isSkipped, isPaused, slides.length]);

  // Fonction skip
  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  // Fonction pause/play
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden"
      >
        {/* Fond animé avec particules - Optimisé (desktop uniquement) */}
        <div className="absolute inset-0 overflow-hidden hidden md:block">
          {[...Array(10)].map((_, i) => {
            // Mémorise les positions initiales pour éviter recalculs
            const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
            const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            const endX = Math.random() * width;
            const endY = Math.random() * height;

            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                initial={{
                  x: startX,
                  y: startY,
                  opacity: 0.2
                }}
                animate={{
                  x: endX,
                  y: endY,
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: Math.random() * 8 + 12,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "reverse"
                }}
              />
            );
          })}
        </div>

        {/* Boutons de contrôle */}
        <div className="absolute top-8 right-8 flex items-center gap-3 z-10">
          {/* Bouton Pause/Play */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={togglePause}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            title={isPaused ? 'Reprendre' : 'Pause'}
          >
            {isPaused ? (
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <Pause className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            )}
          </motion.button>

          {/* Bouton Skip */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleSkip}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <span className="text-sm font-medium">Passer</span>
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </motion.button>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              {/* Icône animée */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
                className={`inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${currentSlideData.color} shadow-2xl mb-8`}
              >
                <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </motion.div>

              {/* Titre */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
              >
                {currentSlideData.title}
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-3"
              >
                {currentSlideData.subtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto"
              >
                {currentSlideData.description}
              </motion.p>

              {/* Indicateurs de slide (Desktop) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="hidden sm:flex items-center justify-center gap-2 mt-12"
              >
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Barre de progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12"
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-2">
                  {isPaused ? (
                    <>
                      <Pause className="w-3 h-3 text-orange-500 animate-pulse" />
                      <span className="text-orange-600 font-medium">En pause</span>
                    </>
                  ) : (
                    'Chargement...'
                  )}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full rounded-full ${
                    isPaused
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Bouton Continuer (apparaît sur le dernier slide) */}
          <AnimatePresence>
            {currentSlide === slides.length - 1 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleSkip}
                className="mt-8 mx-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <span className="font-semibold">Commencer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Version mobile compacte - Indicateurs */}
        <div className="sm:hidden absolute bottom-8 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 bg-blue-600'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
