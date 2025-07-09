// src/renderer/pages/SettingsPage.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/SideBar';

export default function SettingsPage() {
  const [printerMode, setPrinterMode] = useState('single');
  const [ethernetIP, setEthernetIP] = useState('');
  const [ethernetPort, setEthernetPort] = useState(9100);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [savedPassword, setSavedPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    // On mount: fetch settings, order count, and saved password
    Promise.all([
      window.api.fetchSettings(),
      window.api.fetchOrderCount(),
      window.api.fetchPassword()
    ]).then(([settings, count, pass]) => {
      if (settings) {
        setPrinterMode(settings.printerMode || 'single');
        setEthernetIP(settings.ethernetConfig?.ip || '');
        setEthernetPort(settings.ethernetConfig?.port || 9100);
        setRestaurantName(settings.restaurantName || '');
        setRestaurantPhone(settings.restaurantPhone || '');
      }
      setSavedPassword(pass || '');
      setOrderCount(count || 0);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      // If changing password, verify currentPassword first
      if (newPassword) {
        if (currentPassword !== savedPassword) {
          throw new Error('Ancien mot de passe incorrect');
        }
      }
      const newSettings = {
        printerMode,
        ethernetConfig: {
          ip: ethernetIP,
          port: Number(ethernetPort),
          encoding: 'GB18030'
        },
        restaurantName,
        restaurantPhone
      };
      if (newPassword) {
        newSettings.password = newPassword;
      }
      await window.api.updateSettings(newSettings);
      setSaveMessage('Paramètres enregistrés avec succès.');
      if (newPassword) {
        setSavedPassword(newPassword);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setSaveMessage(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleResetCount = async () => {
    setResetting(true);
    setResetMessage('');
    try {
      await window.api.resetOrderCount();
      await window.api.resetDailyTotal();
      setOrderCount(1);
      setResetMessage('Le compteur de commandes et des ventes a été réinitialisé.');
    } catch (err) {
      setResetMessage(`Erreur : ${err.message}`);
    } finally {
      setResetting(false);
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-500 text-lg">Chargement des paramètres…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-8 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#1D150B]">
            Paramètres de l’imprimante et du restaurant
          </h1>

          {/* Restaurant Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#1D150B]">Informations Restaurant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-1">Nom du restaurant</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder="ex : Meilleurs Frères"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-1">Téléphone du restaurant</label>
                <input
                  type="text"
                  value={restaurantPhone}
                  onChange={e => setRestaurantPhone(e.target.value)}
                  placeholder="ex : 0792 68 43 23"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
                />
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#1D150B]">Changer le mot de passe</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-1">Ancien mot de passe</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Entrez l'ancien mot de passe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Laissez vide pour ne pas changer"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
                />
              </div>
            </div>
          </div>

          {/* Printer Settings Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#1D150B]">Paramètres d’imprimante</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-1">Mode d’imprimante</label>
                <select
                  value={printerMode}
                  onChange={e => setPrinterMode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
                >
                  <option value="single">Imprimante unique (USB pour les deux)</option>
                  <option value="dual">Imprimantes doubles (Cuisine : Ethernet, Client : USB)</option>
                </select>
              </div>
              {printerMode === 'dual' && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-2 text-[#1D150B]">Imprimante Cuisine (Ethernet)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium">Adresse IP</label>
                      <input
                        type="text"
                        value={ethernetIP}
                        onChange={e => setEthernetIP(e.target.value)}
                        placeholder="ex : 192.168.0.45"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Port</label>
                      <input
                        type="number"
                        value={ethernetPort}
                        onChange={e => setEthernetPort(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full max-w-md flex items-center justify-center gap-2 ${saving ? 'bg-gray-400' : 'bg-blue-600'}
              text-white py-3 rounded-lg text-lg font-semibold transition-colors hover:opacity-90`}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer les paramètres'}
            </button>
          </div>

          {saveMessage && (
            <p className="text-center text-sm text-green-600 mb-8">{saveMessage}</p>
          )}

          {/* Order Count & Sales Reset Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#1D150B]">Compteur de commandes</h2>
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg">Commandes effectuées :</p>
              <span className="text-xl font-bold text-[#4E71FF]">{orderCount}</span>
            </div>
            <button
              onClick={handleResetCount}
              disabled={resetting}
              className={`w-full bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-red-700 \$
                {resetting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {resetting ? 'Réinitialisation…' : 'Réinitialiser le compteur et ventes'}
            </button>
            {resetMessage && (
              <p className="mt-4 text-sm text-green-600">{resetMessage}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
