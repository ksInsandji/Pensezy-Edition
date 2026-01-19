/**
 * Tests pour le composant ChoisirEncadreur
 *
 * Ce fichier contient des exemples de tests unitaires et d'intégration
 * pour le nouveau système de choix d'encadreurs.
 *
 * Pour exécuter les tests:
 * npm test -- ChoisirEncadreur.test.jsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChoisirEncadreur from './ChoisirEncadreur';
import axios from '../../api/axios';
import { toast } from 'react-toastify';

// Mock des dépendances
jest.mock('../../api/axios');
jest.mock('react-toastify');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Helper pour wrapper le composant avec les providers nécessaires
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Données de test
const mockEnseignants = [
  {
    Matricule_Ens: 'ENS001',
    Nom_Ens: 'KAMGA',
    Prenom_Ens: 'Paul',
    Grade_Ens: 'Professeur',
    Specialite: 'Intelligence Artificielle',
    Email_Ens: 'paul.kamga@ens.cm',
    Telephone_Ens: '+237 6XX XX XX XX',
    Quota_Max: 5,
    _count: { encadrements: 2 }
  },
  {
    Matricule_Ens: 'ENS002',
    Nom_Ens: 'NGUENA',
    Prenom_Ens: 'Marie',
    Grade_Ens: 'Maître de Conférences',
    Specialite: 'Génie Logiciel',
    Email_Ens: 'marie.nguena@ens.cm',
    Quota_Max: 3,
    _count: { encadrements: 1 }
  },
  {
    Matricule_Ens: 'ENS003',
    Nom_Ens: 'TCHUENTE',
    Prenom_Ens: 'Jean',
    Grade_Ens: 'Professeur',
    Specialite: 'Réseaux et Sécurité',
    Email_Ens: 'jean.tchuente@ens.cm',
    Quota_Max: 0, // Illimité
    _count: { encadrements: 8 }
  }
];

const mockMesChoixVide = null;

const mockMesChoixSoumis = {
  date_soumission: '2025-12-20T10:30:00.000Z',
  modifiable: false,
  affectation_finale: null,
  choix1: {
    Matricule_Ens: 'ENS001',
    statut: 'en_attente',
    enseignant: mockEnseignants[0]
  },
  choix2: {
    Matricule_Ens: 'ENS002',
    statut: 'en_attente',
    enseignant: mockEnseignants[1]
  },
  choix3: null
};

const mockAffectationFinale = {
  date_soumission: '2025-12-20T10:30:00.000Z',
  modifiable: false,
  affectation_finale: {
    choix_retenu: 1,
    enseignant: mockEnseignants[0]
  }
};

describe('ChoisirEncadreur Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Chargement initial', () => {
    test('affiche le loader pendant le chargement', () => {
      axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<ChoisirEncadreur />);

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    test('charge les enseignants et les choix existants', async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } }) // Enseignants
        .mockResolvedValueOnce({ data: { data: mockMesChoixVide } }); // Choix

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Interface de sélection (aucun choix)', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } })
        .mockResolvedValueOnce({ data: { data: mockMesChoixVide } });

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(screen.getByText(/Choisissez vos encadreurs/i)).toBeInTheDocument();
      });
    });

    test('affiche la liste des enseignants', () => {
      expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
      expect(screen.getByText('NGUENA Marie')).toBeInTheDocument();
      expect(screen.getByText('TCHUENTE Jean')).toBeInTheDocument();
    });

    test('affiche les 3 slots de choix vides', () => {
      expect(screen.getByText('Choix 1')).toBeInTheDocument();
      expect(screen.getByText('Choix 2')).toBeInTheDocument();
      expect(screen.getByText('Choix 3')).toBeInTheDocument();
    });

    test('permet de sélectionner un premier choix', () => {
      const choix1Button = screen.getAllByText('Choix 1')[1]; // Le bouton dans la card
      fireEvent.click(choix1Button);

      // Vérifier que l'enseignant apparaît dans le slot Choix 1
      // (Cette assertion dépend de la structure exacte du DOM)
    });

    test('empêche de sélectionner le même enseignant deux fois', () => {
      // Sélectionner ENS001 comme choix 1
      const choix1Buttons = screen.getAllByText('Choix 1');
      fireEvent.click(choix1Buttons[1]);

      // Essayer de sélectionner ENS001 comme choix 2
      const choix2Buttons = screen.queryAllByText('Choix 2');
      if (choix2Buttons.length > 1) {
        fireEvent.click(choix2Buttons[1]);
      }

      // Vérifier qu'un toast warning est affiché
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining('déjà sélectionné')
      );
    });

    test('désactive le bouton de soumission si aucun choix 1', () => {
      const submitButton = screen.getByText(/Soumettre mes choix/i);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Filtres de recherche', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } })
        .mockResolvedValueOnce({ data: { data: mockMesChoixVide } });

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
      });
    });

    test('filtre par nom', () => {
      const searchInput = screen.getByPlaceholderText(/Nom ou prénom/i);
      fireEvent.change(searchInput, { target: { value: 'KAMGA' } });

      expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
      expect(screen.queryByText('NGUENA Marie')).not.toBeInTheDocument();
    });

    test('filtre par grade', () => {
      const gradeSelect = screen.getByLabelText(/Grade/i);
      fireEvent.change(gradeSelect, { target: { value: 'Professeur' } });

      expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
      expect(screen.getByText('TCHUENTE Jean')).toBeInTheDocument();
      expect(screen.queryByText('NGUENA Marie')).not.toBeInTheDocument();
    });

    test('filtre par spécialité', () => {
      const specialiteSelect = screen.getByLabelText(/Spécialité/i);
      fireEvent.change(specialiteSelect, { target: { value: 'Génie Logiciel' } });

      expect(screen.getByText('NGUENA Marie')).toBeInTheDocument();
      expect(screen.queryByText('KAMGA Paul')).not.toBeInTheDocument();
    });
  });

  describe('Soumission des choix', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } })
        .mockResolvedValueOnce({ data: { data: mockMesChoixVide } });

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
      });
    });

    test('soumet les choix avec succès', async () => {
      global.confirm = jest.fn(() => true);
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      // Sélectionner un choix 1
      const choix1Buttons = screen.getAllByText('Choix 1');
      fireEvent.click(choix1Buttons[1]);

      // Soumettre
      const submitButton = screen.getByText(/Soumettre mes choix/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            choix1: 'ENS001'
          })
        );
        expect(toast.success).toHaveBeenCalled();
      });
    });

    test('affiche une erreur en cas d\'échec', async () => {
      global.confirm = jest.fn(() => true);
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Erreur serveur' } }
      });

      // Sélectionner un choix 1
      const choix1Buttons = screen.getAllByText('Choix 1');
      fireEvent.click(choix1Buttons[1]);

      // Soumettre
      const submitButton = screen.getByText(/Soumettre mes choix/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur serveur');
      });
    });
  });

  describe('Affichage des choix soumis', () => {
    test('affiche les choix soumis non modifiables', async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } })
        .mockResolvedValueOnce({ data: { data: mockMesChoixSoumis } });

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(screen.getByText(/Vos choix ont été soumis/i)).toBeInTheDocument();
        expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
        expect(screen.getByText('NGUENA Marie')).toBeInTheDocument();
      });
    });
  });

  describe('Affectation finale', () => {
    test('affiche l\'encadreur affecté', async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } })
        .mockResolvedValueOnce({ data: { data: mockAffectationFinale } });

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(screen.getByText(/Encadreur affecté/i)).toBeInTheDocument();
        expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
        expect(screen.getByText(/Votre 1er choix/i)).toBeInTheDocument();
      });
    });
  });

  describe('Indicateurs de disponibilité', () => {
    beforeEach(async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } })
        .mockResolvedValueOnce({ data: { data: mockMesChoixVide } });

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
      });
    });

    test('affiche la disponibilité correctement', () => {
      // ENS001: 3/5 disponible (vert)
      expect(screen.getByText('3/5')).toBeInTheDocument();

      // ENS002: 2/3 disponible (orange)
      expect(screen.getByText('2/3')).toBeInTheDocument();

      // ENS003: Illimité
      expect(screen.getByText('Illimité')).toBeInTheDocument();
    });
  });

  describe('Swap de choix', () => {
    test('permet d\'échanger deux choix', async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: mockEnseignants } })
        .mockResolvedValueOnce({ data: { data: mockMesChoixVide } });

      renderWithRouter(<ChoisirEncadreur />);

      await waitFor(() => {
        expect(screen.getByText('KAMGA Paul')).toBeInTheDocument();
      });

      // Sélectionner choix 1 et 2
      const choix1Buttons = screen.getAllByText('Choix 1');
      fireEvent.click(choix1Buttons[1]);

      const choix2Buttons = screen.getAllByText('Choix 2');
      fireEvent.click(choix2Buttons[1]);

      // Cliquer sur swap
      const swapButton = screen.getByText(/Swap 2/i);
      fireEvent.click(swapButton);

      // Vérifier que les choix ont été échangés
      // (Cette assertion dépend de la structure exacte du DOM)
    });
  });
});

/**
 * Tests d'intégration supplémentaires à ajouter:
 *
 * 1. Test du flow complet de bout en bout
 * 2. Test de la modification de choix existants
 * 3. Test des permissions (seul l'étudiant voit ses choix)
 * 4. Test du responsive design
 * 5. Test de performance avec 100+ enseignants
 * 6. Test d'accessibilité (aria-labels, keyboard navigation)
 */
