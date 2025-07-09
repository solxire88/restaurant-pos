// src/renderer/pages/StaffPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  DollarSign,
  UserMinus,
  X as XIcon,
  User,
  CircleDollarSign,
  FileText,
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';
import Sidebar from '../components/SideBar';

export default function StaffPage() {
  // Authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Staff & expenses state
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Modal/form state
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    status: 'Non payé'
  });

  // 1) Try login
  const handleLogin = async () => {
    setAuthError('');
    try {
      const savedPass = await window.api.fetchPassword();
      if (passwordInput === savedPass) {
        setAuthenticated(true);
      } else {
        setAuthError('Mot de passe incorrect');
      }
    } catch {
      setAuthError('Erreur lors de la vérification du mot de passe');
    }
  };

  // 2) Once authenticated, fetch staff & expenses
  useEffect(() => {
    if (!authenticated) return;

    async function fetchData() {
      try {
        const [staffData, expensesData] = await Promise.all([
          window.api.fetchStaff(),
          window.api.fetchExpenses()
        ]);
        setStaff(staffData || []);
        setExpenses(expensesData || []);
      } catch (error) {
        console.error('Erreur de récupération des données :', error);
        setStaff([]);
        setExpenses([]);
      }
    }

    fetchData();
  }, [authenticated]);

  // 3) If not authenticated, show login screen
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
            {authError && <p className="mt-4 text-red-600 text-center">{authError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // 4) Otherwise render the original StaffPage
  const formatDateFr = isoDate => {
    try {
      return new Date(isoDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return isoDate;
    }
  };

  const handleAddStaff = e => {
    e.preventDefault();
    window.api.createStaff({ name: form.name, position: form.position })
      .then(newStaff => setStaff(s => [...s, newStaff]))
      .catch(err => console.error('Erreur lors de la création du personnel :', err));
    setModal(null);
  };

  const handleRemoveStaff = e => {
    e.preventDefault();
    window.api.deleteStaff(form.staffId)
      .then(id => {
        setStaff(s => s.filter(x => x.id !== id));
        setExpenses(ex => ex.filter(x => x.staffId !== id));
      })
      .catch(err => console.error('Erreur lors de la suppression du personnel :', err));
    setModal(null);
  };

  const handleAddExpense = e => {
    e.preventDefault();
    window.api.createExpense(form)
      .then(newExp => setExpenses(ex => [...ex, newExp]))
      .catch(err => console.error('Erreur lors de la création de la dépense :', err));
    setModal(null);
  };

  const toggleStatus = id => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    const newStatus = exp.status === 'Payé' ? 'Non payé' : 'Payé';
    window.api.updateExpenseStatus(id, newStatus)
      .then(updated => {
        if (updated) {
          setExpenses(ex => ex.map(e => e.id === id ? updated : e));
        }
      })
      .catch(err => console.error('Erreur lors de la mise à jour du statut :', err));
  };

  const handleDeleteExpense = id => {
    window.api.deleteExpense(id)
      .then(deletedId => setExpenses(ex => ex.filter(e => e.id !== deletedId)))
      .catch(err => console.error('Erreur lors de la suppression de la dépense :', err));
  };

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Dépenses du personnel</h1>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <User size={16} /> Employé
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <CircleDollarSign size={16} /> Prix
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <FileText size={16} /> Description
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <CalendarIcon size={16} /> Date
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <Square size={16} /> Statut
                    </div>
                  </th>
                  <th className="px-4 py-2 text-center">
                    <div className="inline-flex items-center gap-1">
                      <Trash2 size={16} /> Supprimer
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      Aucune dépense enregistrée.
                    </td>
                  </tr>
                ) : (
                  expenses.map(exp => {
                    const staffMember = staff.find(s => s.id === exp.staffId);
                    return (
                      <motion.tr
                        key={exp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="even:bg-gray-50 hover:bg-gray-100"
                      >
                        <td className="border-t px-4 py-2">{staffMember?.name || '—'}</td>
                        <td className="border-t px-4 py-2 text-[#4E71FF] font-semibold">
                          {parseFloat(exp.price).toFixed(2)} D.A
                        </td>
                        <td className="border-t px-4 py-2">{exp.description}</td>
                        <td className="border-t px-4 py-2">{formatDateFr(exp.date)}</td>
                        <td className="border-t px-4 py-2">
                          <motion.button
                            onClick={() => toggleStatus(exp.id)}
                            whileTap={{ scale: 0.9 }}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                              ${exp.status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {exp.status === 'Payé' ? <CheckSquare size={14} /> : <Square size={14} />}
                            {exp.status}
                          </motion.button>
                        </td>
                        <td className="border-t px-4 py-2 text-center">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Supprimer cette dépense"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>

        <aside className="w-80 bg-white p-6 flex flex-col space-y-4 gap-4 shadow-inner">
          <button
            onClick={() => { setForm({}); setModal('addStaff'); }}
            className="flex items-center justify-center gap-2 py-3 bg-[#4E71FF] text-white rounded-lg text-lg font-medium hover:bg-[#5409DA] transition"
          >
            <UserPlus size={20} /> Ajouter un employé
          </button>
          <button
            onClick={() => {
              setForm({ date: new Date().toISOString().slice(0, 10), status: 'Non payé' });
              setModal('addExpense');
            }}
            className="flex items-center justify-center gap-2 py-3 bg-[#4E71FF] text-white rounded-lg text-lg font-medium hover:bg-[#5409DA] transition"
          >
            <DollarSign size={20} /> Ajouter une dépense
          </button>
          <button
            onClick={() => { setForm({}); setModal('removeStaff'); }}
            className="flex items-center justify-center gap-2 py-3 bg-white text-[#4E71FF] border border-[#4E71FF] rounded-lg text-lg font-medium hover:bg-orange-50 transition"
          >
            <UserMinus size={20} /> Supprimer un employé
          </button>
        </aside>
      </div>

      <AnimatePresence>
        {modal === 'addStaff' && (
          <Modal title="Ajouter un employé" onClose={() => setModal(null)}>
            <form onSubmit={handleAddStaff} className=" gap-4 ">
              <input
                className="w-full border rounded px-3 my-2 py-2"
                placeholder="Nom"
                value={form.name || ''}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="w-full border rounded px-3 my-2 py-2"
                placeholder="Poste"
                value={form.position || ''}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                required
              />
              <button
                type="submit"
                className="w-full my-2 py-2 bg-[#4E71FF] text-white rounded hover:bg-[#5409DA] transition"
              >
                Enregistrer
              </button>
            </form>
          </Modal>
        )}
        {modal === 'removeStaff' && (
          <Modal title="Supprimer un employé" onClose={() => setModal(null)}>
            <form onSubmit={handleRemoveStaff} className="space-y-4 gap-4">
              <select
                className="w-full border rounded px-3 my-2 py-2"
                value={form.staffId || ''}
                onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                required
              >
                <option className='my-2 ' value="">Sélectionner un employé</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full py-2 my-2  bg-white text-[#4E71FF] border border-[#4E71FF] rounded hover:bg-orange-50 transition"
              >
                Supprimer
              </button>
            </form>
          </Modal>
        )}
        {modal === 'addExpense' && (
          <Modal title="Ajouter une dépense" onClose={() => setModal(null)}>
            <form onSubmit={handleAddExpense} className="space-y-4 gap-4">
              <select
                className="w-full border rounded my-2  px-3 py-2"
                value={form.staffId || ''}
                onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                required
              >
                <option className="my-2 " value="">Sélectionner un employé</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="relative">
                <CircleDollarSign className="absolute left-3   top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  className="w-full border rounded px-3 py-2 my-2  pl-10"
                  type="number"
                  step="0.01"
                  placeholder="Prix"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2  -translate-y-1/2 text-gray-400" size={16} />
                <input
                  className="w-full border rounded px-3 py-2 my-2  pl-10"
                  type="date"
                  value={form.date || ''}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2  -translate-y-1/2 text-gray-400" size={16} />
                <textarea
                  className="w-full border rounded px-3 py-2 my-2  pl-10"
                  placeholder="Description"
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <select
                className="w-full border rounded px-3 my-2 py-2"
                value={form.status || 'Non payé'}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required
              >
                <option>Payé</option>
                <option>Non payé</option>
              </select>
              <button
                type="submit"
                className="w-full py-2 bg-[#4E71FF] text-white rounded hover:bg-[#5409DA] transition"
              >
                Enregistrer
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// Modal wrapper
function Modal({ title, children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-full relative"
        initial={{ y: 20, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          <XIcon size={18} />
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}
