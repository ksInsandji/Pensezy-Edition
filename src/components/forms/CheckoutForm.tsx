import React, { useState, useEffect, lazy } from 'react';
import { useLocation } from 'react-router-dom';

// Lazy load du SplashScreen pour optimiser le bundle initial
const SplashScreen = lazy(() => import('./SplashScreen'));

/**
 * Wrapper pour afficher le SplashScreen à chaque visite
 * Gère l'état d'affichage et la transition vers le contenu principal
 * Optimisé avec lazy loading et Suspense
 */
const SplashScreenWrapper = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    const authenticated = !!token;
    setIsAuthenticated(authenticated);

    // Afficher le splash uniquement si non authentifié et sur login
    if (!authenticated && (location.pathname === '/login' || location.pathname === '/')) {
      setShowSplash(true);
    }
  }, []);

  // Gérer le changement de route
  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/') {
      if (!isAuthenticated) {
        setShowSplash(true);
      } else {
        setShowSplash(false);
      }
    } else {
      setShowSplash(false);
    }
  }, [location.pathname, isAuthenticated]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Si on affiche le splash et qu'on n'est pas authentifié
  if (showSplash && !isAuthenticated && (location.pathname === '/login' || location.pathname === '/')) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Sinon, afficher le contenu normal
  return <>{children}</>;
};

export default SplashScreenWrapper;
