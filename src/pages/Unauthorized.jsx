import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <ShieldX className="w-24 h-24 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-800 mt-6">Accès non autorisé</h1>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/login">
            <Button>
              Se connecter
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}
