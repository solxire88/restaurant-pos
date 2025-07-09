// src/renderer/pages/SalesPage.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/SideBar';

export default function SalesPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [dailyTotal, setDailyTotal] = useState(0);
  const [salesRecords, setSalesRecords] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const handleLogin = async () => {
    setError('');
    try {
      const savedPass = await window.api.fetchPassword();
      if (passwordInput === savedPass) {
        setAuthenticated(true);
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur lors de la vérification du mot de passe');
    }
  };

  useEffect(() => {
    if (authenticated) {
      setLoadingData(true);
      Promise.all([window.api.fetchDailyTotal(), window.api.fetchSalesRecords()])
        .then(([total, records]) => {
          setDailyTotal(total || 0);
          setSalesRecords(records || []);
        })
        .catch(() => {
          setError('Erreur lors du chargement des données de vente');
        })
        .finally(() => setLoadingData(false));
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center bg-white">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Accès Propriétaire</h1>
            <input
              type="password"
              placeholder="Entrez le mot de passe"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Connexion
            </button>
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#1D150B]">Historique des ventes</h1>

          {loadingData ? (
            <p className="text-gray-500 text-center">Chargement des données…</p>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-2 text-[#1D150B]">Total du jour</h2>
                <p className="text-3xl font-bold text-[#4E71FF]">{dailyTotal} D.A</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4 text-[#1D150B]">Ventes précédentes</h2>
                {salesRecords.length === 0 ? (
                  <p className="text-gray-500 text-center">Aucun enregistrement de vente.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 border-b border-gray-200 text-left text-gray-700 font-medium">
                            Date
                          </th>
                          <th className="px-6 py-3 border-b border-gray-200 text-right text-gray-700 font-medium">
                            Total (D.A)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesRecords
                          .slice()
                          .reverse()
                          .map((rec, idx) => (
                            <tr key={idx} className="hover:bg-gray-100">
                              <td className="px-6 py-4 border-b border-gray-200 text-gray-800">
                                {rec.date}
                              </td>
                              <td className="px-6 py-4 border-b border-gray-200 text-right text-gray-800">
                                {rec.total}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
