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
  Square
} from 'lucide-react';
import Sidebar from '../components/SideBar';

export default function StaffPage() {
  // Staff and expenses state
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);
  // modal type and form data
  const [modal, setModal] = useState(null); // 'addStaff'|'removeStaff'|'addExpense'
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), status: 'Unpaid' });

  useEffect(() => {
    // Fetch staff and expenses data when component mounts
    async function fetchData() {
      try {
        const staffData = await window.api.fetchStaff();
        setStaff(staffData || []); // Ensure we always have an array
        
        const expensesData = await window.api.fetchExpenses();
        setExpenses(expensesData || []); // Ensure we always have an array
      } catch (error) {
        console.error('Error fetching data:', error);
        // Initialize with empty arrays if fetching fails
        setStaff([]);
        setExpenses([]);
      }
    }
    
    fetchData();
  }, []);

  // Create staff
  function handleAddStaff(e) {
    e.preventDefault();
    window.api.createStaff({ name: form.name, position: form.position })
      .then(newStaff => setStaff(s => [...s, newStaff]))
      .catch(err => console.error('Error creating staff:', err));
    setModal(null);
  }

  // Delete staff
  function handleRemoveStaff(e) {
    e.preventDefault();
    window.api.deleteStaff(form.staffId)
      .then(id => {
        setStaff(s => s.filter(x => x.id !== id));
        setExpenses(ex => ex.filter(x => x.staffId !== id));
      })
      .catch(err => console.error('Error deleting staff:', err));
    setModal(null);
  }

  // Create expense
  function handleAddExpense(e) {
    e.preventDefault();
    window.api.createExpense(form)
      .then(newExp => setExpenses(ex => [...ex, newExp]))
      .catch(err => console.error('Error creating expense:', err));
    setModal(null);
  }

  // Toggle status
  function toggleStatus(id) {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    
    const newStatus = exp.status === 'Paid' ? 'Unpaid' : 'Paid';
    window.api.updateExpenseStatus(id, newStatus)
      .then(updated => {
        if (updated) {
          setExpenses(ex => ex.map(e => e.id === id ? updated : e));
        }
      })
      .catch(err => console.error('Error updating status:', err));
  }

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Staff Expenses</h1>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full table-auto"> 
              <thead className="bg-gray-100"> 
                <tr> 
                  <th className="px-4 py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <User size={16} /> Staff
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <CircleDollarSign size={16} /> Price
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
                      <Square size={16} /> Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No expenses recorded.
                    </td>
                  </tr>
                ) : expenses.map(exp => {
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
                      <td className="border-t px-4 py-2 text-orange-600 font-semibold">
                        ${parseFloat(exp.price).toFixed(2)}
                      </td>
                      <td className="border-t px-4 py-2">{exp.description}</td>
                      <td className="border-t px-4 py-2">{exp.date}</td>
                      <td className="border-t px-4 py-2">
                        <motion.button
                          onClick={() => toggleStatus(exp.id)}
                          whileTap={{ scale: 0.9 }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                            ${exp.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {exp.status === 'Paid'
                            ? <CheckSquare size={14} /> : <Square size={14} />}
                          {exp.status}
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>

        {/* Right panel */}
        <aside className="w-80 bg-white p-6 flex flex-col space-y-4 shadow-inner">
          <button
            onClick={() => { setForm({}); setModal('addStaff'); }}
            className="flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-lg text-lg font-medium hover:bg-orange-700 transition"
          >
            <UserPlus size={20} /> Add Staff
          </button>
          <button
            onClick={() => { setForm({ date: new Date().toISOString().slice(0, 10), status: 'Unpaid' }); setModal('addExpense'); }}
            className="flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-lg text-lg font-medium hover:bg-orange-700 transition"
          >
            <DollarSign size={20} /> Add Expense
          </button>
          <button
            onClick={() => { setForm({}); setModal('removeStaff'); }}
            className="flex items-center justify-center gap-2 py-3 bg-white text-orange-600 border border-orange-600 rounded-lg text-lg font-medium hover:bg-orange-50 transition"
          >
            <UserMinus size={20} /> Remove Staff
          </button>
        </aside>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'addStaff' && (
          <Modal title="Add Staff Member" onClose={() => setModal(null)}>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Name"
                value={form.name || ''}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Position"
                value={form.position || ''}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
              >
                Save
              </button>
            </form>
          </Modal>
        )}
        {modal === 'removeStaff' && (
          <Modal title="Remove Staff Member" onClose={() => setModal(null)}>
            <form onSubmit={handleRemoveStaff} className="space-y-4">
              <select
                className="w-full border rounded px-3 py-2"
                value={form.staffId || ''}
                onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                required
              >
                <option value="">Select Staff</option>
                {Array.isArray(staff) && staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full py-2 bg-white text-orange-600 border border-orange-600 rounded hover:bg-orange-50 transition"
              >
                Delete
              </button>
            </form>
          </Modal>
        )}
        {modal === 'addExpense' && (
          <Modal title="Add Expense" onClose={() => setModal(null)}>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <select
                className="w-full border rounded px-3 py-2"
                value={form.staffId || ''}
                onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                required
              >
                <option value="">Select Staff</option>
                {Array.isArray(staff) && staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  className="w-full border rounded px-3 py-2 pl-10"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  className="w-full border rounded px-3 py-2 pl-10"
                  type="date"
                  value={form.date || ''}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <textarea
                  className="w-full border rounded px-3 py-2 pl-10"
                  placeholder="Description"
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.status || 'Unpaid'}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required
              >
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
              <button
                type="submit"
                className="w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
              >
                Save
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