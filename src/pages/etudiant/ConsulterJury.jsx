import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import axios from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from 'react-toastify';
import { Calendar, Clock, MapPin, Users, Award, FileText, Upload, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ConsulterJury() {
  const [jury, setJury] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pptFile, setPptFile] = useState(null);

  useEffect(() => {
    fetchJury();
    fetchDocuments();
  }, []);

  const fetchJury = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ETUDIANT_JURY);
      setJury(response.data.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Erreur lors du chargement du jury');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ETUDIANT_DOCUMENTS);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile && !pptFile) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (pdfFile) formData.append('pdf', pdfFile);
    if (pptFile) formData.append('powerpoint', pptFile);

    try {
      await axios.post(ENDPOINTS.ETUDIANT_UPLOAD_DOCUMENT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Documents uploadés avec succès');
      setPdfFile(null);
      setPptFile(null);
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (idDocument) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;

    try {
      await axios.delete(ENDPOINTS.ETUDIANT_DELETE_DOCUMENT(idDocument));
      toast.success('Document supprimé');
      fetchDocuments();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!jury) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Jury non encore constitué</h2>
            <p className="text-gray-600 mt-2">
              Votre jury de soutenance n'a pas encore été créé. 
              Vous serez notifié dès qu'il sera constitué.
            </p>
          </div>
        </Card>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Thème */}
        {jury.etudiant?.[0]?.theme && jury.etudiant[0].theme.length > 0 && (
          <Card title="Thème de soutenance">
            <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {jury.etudiant[0].theme[0].Titre}
                </h3>
                {jury.etudiant[0].theme[0].Description && (
                  <p className="text-gray-700 leading-relaxed">
                    {jury.etudiant[0].theme[0].Description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card title="Informations sur la soutenance">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">
                  {format(new Date(jury.Date_Soutenance), 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Heure</p>
                <p className="font-semibold">{jury.Heure_Soutenance}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Salle</p>
                <p className="font-semibold">{jury.Salle}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Membres du jury">
          <div className="space-y-4">
            {jury.membres && jury.membres.length > 0 ? (
              jury.membres.map((membre) => (
                <div key={membre.Id_Membre_Jury} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {membre.enseignant?.Prenom_Ens?.[0]}{membre.enseignant?.Nom_Ens?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {membre.enseignant?.Prenom_Ens} {membre.enseignant?.Nom_Ens}
                      </p>
                      <p className="text-sm text-gray-500">{membre.enseignant?.Grade_Ens}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    membre.Role === 'President' ? 'bg-yellow-100 text-yellow-800' :
                    membre.Role === 'Rapporteur' ? 'bg-blue-100 text-blue-800' :
                    membre.Role === 'Examinateur' ? 'bg-green-100 text-green-800' :
                    membre.Role === 'Encadreur' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {membre.Role === 'President' ? '👔 Président' :
                     membre.Role === 'Rapporteur' ? '📋 Rapporteur' :
                     membre.Role === 'Examinateur' ? '❓ Examinateur' :
                     membre.Role === 'Encadreur' ? '👨‍🏫 Encadreur' :
                     membre.Role}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Les membres du jury n'ont pas encore été assignés</p>
              </div>
            )}
          </div>
        </Card>
        
        {jury.Note_Finale && (
          <Card title="Résultats">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Award className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Note finale</p>
                  <p className="text-2xl font-bold text-green-600">{jury.Note_Finale}/20</p>
                </div>
              </div>
              {jury.Mention && (
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-gray-500">Mention</p>
                  <p className="text-xl font-bold text-primary-600">{jury.Mention}</p>
                </div>
              )}
            </div>
            {jury.Observations && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Observations</p>
                <p className="text-gray-700">{jury.Observations}</p>
              </div>
            )}
          </Card>
        )}

        {/* Documents du mémoire - Uniquement si note finale existe */}
        {jury.Note_Finale && (
          <Card title="📚 Documents du mémoire">
            <div className="space-y-6">
              {/* Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Déposez ici la version numérique de votre mémoire (PDF) et votre présentation PowerPoint.
                  Ces documents serviront de référence pour les futurs étudiants.
                </p>
              </div>

              {/* Zone d'upload */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                    📄 Mémoire (PDF) - Max 50MB
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {pdfFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      Sélectionné: {pdfFile.name} ({formatFileSize(pdfFile.size)})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                    📊 Présentation PowerPoint - Max 50MB
                  </label>
                  <input
                    type="file"
                    accept=".ppt,.pptx,.odp"
                    onChange={(e) => setPptFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100"
                  />
                  {pptFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      Sélectionné: {pptFile.name} ({formatFileSize(pptFile.size)})
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={uploading || (!pdfFile && !pptFile)}
                  className="w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Upload en cours...' : 'Uploader les documents'}
                </Button>
              </div>

              {/* Liste des documents uploadés */}
              {documents.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Documents uploadés</h3>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.Id_Document}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {doc.Type_Document === 'PDF' ? (
                            <FileText className="w-5 h-5 text-red-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-orange-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{doc.Nom_Fichier}</p>
                            <p className="text-xs text-gray-500">
                              {doc.Type_Document} • {formatFileSize(doc.Taille_Fichier)} •
                              Uploadé le {new Date(doc.Date_Upload).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.Id_Document)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
