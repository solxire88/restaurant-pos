// src/pages/MenuPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Pizza, Sandwich, CupSoda, IceCream,
  Plus, Trash2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/SideBar';

const categories = [
  { name: 'All',        icon: null     },
  { name: 'Pizza',      icon: Pizza    },
  { name: 'Sandwiches', icon: Sandwich },
  { name: 'Drinks',     icon: CupSoda  },
  { name: 'Desserts',   icon: IceCream },
];

export default function MenuPage() {
  // — replace initialMenu with data from backend —
  const [menuItems, setMenuItems]       = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCategory, setCategory] = useState('All');
  const [selectedId, setSelectedId]     = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // 1) On mount, load menu from backend
  useEffect(() => {
    window.api.fetchMenu()
      .then(items => setMenuItems(items))
      .catch(err => console.error('Failed to load menu:', err));
  }, []);

  // 2) Filter logic unchanged
  const filtered = useMemo(() => {
    return menuItems.filter(item => {
      const byCat    = selectedCategory === 'All' || item.category === selectedCategory;
      const bySearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return byCat && bySearch;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // 3) Add new item via backend
  const handleAddSave = (newItem) => {
    window.api.createMenu(newItem)
      .then(created => {
        setMenuItems(prev => [...prev, created]);
        setShowAddModal(false);
      })
      .catch(err => console.error('Add failed:', err));
  };

  // 4) Delete selected via backend
  const handleDelete = () => {
    if (!selectedId) return;
    window.api.deleteMenu(selectedId)
      .then(() => {
        setMenuItems(prev => prev.filter(i => i.id !== selectedId));
        setSelectedId(null);
      })
      .catch(err => console.error('Delete failed:', err));
  };

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6 bg-white overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Manage Menu</h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED6827]"
            />
          </div>

          {/* Categories */}
          <div className="flex space-x-2 mb-6 overflow-x-auto overflow-y-hidden"> 
            {categories.map(({ name, icon: Icon }) => (
              <motion.button
                key={name}
                onClick={() => setCategory(name)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 h-12 rounded-full font-medium transition-all transform whitespace-nowrap
                  ${selectedCategory === name
                    ? 'bg-[#ED6827] text-white scale-105'
                    : 'bg-gray-200 text-[#1D150B] hover:bg-[#ffe6d8] hover:scale-105'}
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {name}
              </motion.button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                whileTap={{ scale: 0.97 }}
                className={`bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between
                  hover:shadow-lg transition-shadow duration-200 aspect-square cursor-pointer
                  ${selectedId === item.id ? 'ring-4 ring-[#ED6827]/50' : ''}
                `}
              >
                <div>
                  <h3 className="text-2xl font-semibold text-[#1D150B] mb-2">{item.name}</h3>
                  <p className="text-base text-gray-500 mb-4 flex-1">{item.description}</p>
                </div>
                <span className="text-xl font-bold text-[#ED6827]">${item.price.toFixed(2)}</span>
              </motion.div>
            ))}
          </div>
        </main>

        {/* Actions panel */}
        <aside className="w-80 bg-[#F9F9F9] p-6 flex flex-col shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-[#1D150B]">Actions</h2>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mb-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#ED6827] text-white font-medium"
          >
            <Plus size={18} /> Add Item
          </motion.button>
          <motion.button
            onClick={handleDelete}
            whileHover={{ scale: selectedId ? 1.03 : 1 }}
            whileTap={{ scale: selectedId ? 0.97 : 1 }}
            disabled={!selectedId}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg
              ${selectedId
                ? 'bg-white text-[#1D150B] border border-[#ED6827] hover:bg-[#FFEDE3]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              font-medium transition-colors
            `}
          >
            <Trash2 size={18} /> Delete Selected
          </motion.button>
        </aside>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 w-80 max-w-full relative"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-[#1D150B]">Add Menu Item</h2>

              <form onSubmit={e => {
                e.preventDefault();
                const f = e.target;
                handleAddSave({
                  name:        f.name.value,
                  category:    f.category.value,
                  price:       parseFloat(f.price.value),
                  description: f.description.value
                });
                f.reset();
              }} className="space-y-4">
                <input name="name" placeholder="Name" required className="w-full border rounded-lg px-3 py-2" />
                <select name="category" required className="w-full border rounded-lg px-3 py-2">
                  <option value="">Category</option>
                  {categories.slice(1).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <input name="price" type="number" step="0.01" placeholder="Price" required className="w-full border rounded-lg px-3 py-2" />
                <textarea name="description" placeholder="Description" required className="w-full border rounded-lg px-3 py-2" />
                <button type="submit" className="w-full py-3 bg-[#ED6827] text-white rounded-lg font-medium">
                  Save
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
