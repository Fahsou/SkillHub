import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ClientDashTest() {
  const [publishedCount, setPublishedCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [missions, setMissions] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [publishedRes, acceptedRes, missionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/missions/count/published-by-client', { headers }),
          axios.get('http://localhost:5000/api/missions/count/accepted-by-client', { headers }),
          axios.get('http://localhost:5000/api/missions/mission-has-application', { headers }),
        ]);

        setPublishedCount(publishedRes.data.count);
        setAcceptedCount(acceptedRes.data.count);
        setMissions(missionsRes.data);
      } catch (err) {
        console.error('Erreur lors du chargement du tableau de bord:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const fetchApplications = async (missionId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/by-mission/${missionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) => ({ ...prev, [missionId]: res.data }));
    } catch (err) {
      console.error('Erreur lors de la récupération des candidatures:', err);
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optionnel : rafraîchir les candidatures
      const updated = Object.keys(applications).find((key) =>
        applications[key].some((app) => app.id_applications === appId)
      );
      if (updated) fetchApplications(updated);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la candidature:', err);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tableau de bord client</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Missions publiées</h3>
          <p>{publishedCount}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Missions acceptées</h3>
          <p>{acceptedCount}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Vos missions</h3>
      {missions.map((mission) => (
        <div key={mission.id_missions} className="mb-4 p-4 border rounded">
          <h4 className="font-bold">{mission.title}</h4>
          <p>{mission.description}</p>
          <p className="text-sm text-gray-600">
            Candidatures reçues : {mission.application_count}
          </p>
          <button
            onClick={() => fetchApplications(mission.id_missions)}
            className="text-blue-600 underline mt-2"
          >
            Voir les candidatures
          </button>

          {applications[mission.id_missions] && (
            <ul className="mt-2 space-y-2">
              {applications[mission.id_missions].map((app) => (
                <li key={app.id_applications} className="border p-2 rounded">
                  <p>Nom du candidat : {app.user?.name || 'Inconnu'}</p>
                  <p>Status : {app.status}</p>
                  <div className="space-x-2 mt-1">
                    <button
                      onClick={() => handleStatusChange(app.id_applications, 'accepted')}
                      className="bg-green-200 px-2 py-1 rounded"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id_applications, 'rejected')}
                      className="bg-red-200 px-2 py-1 rounded"
                    >
                      Rejeter
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};



