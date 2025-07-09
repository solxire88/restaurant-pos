import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  List,
  Utensils,
  Leaf,
  Pizza,
  Sandwich,
  Soup,
  Drumstick,
  Users,
  CupSoda,
  Droplet,
  Coffee,
  Snowflake,
  Donut,
  IceCream,
  X,
  PencilOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/SideBar';

const categories = [
  { name: 'All',                icon: List       },
  { name: 'Entrée',             icon: Utensils   },
  { name: 'Salades',            icon: Leaf       },
  { name: 'Gratins',            icon: Soup       },
  { name: 'Baguettes Farcies',  icon: Sandwich  },
  { name: 'Calzones',           icon: Pizza      },
  { name: 'Sandwiches',         icon: Sandwich   },
  { name: 'Tacos',              icon: Sandwich   },
  { name: 'Burgers',            icon: Sandwich  },
  { name: 'Fajitas',            icon: Soup       },
  { name: 'Chapati',            icon: Sandwich   },
  { name: 'Box',                icon: Users      },
  { name: 'Wings',              icon: Drumstick  },
  { name: 'Snacks',             icon: Sandwich  },  
  { name: 'Plats',              icon: Utensils   },
  { name: 'Plat Familial',      icon: Users      },
  { name: 'Pizza (Tomate)',     icon: Pizza      },
  { name: 'Pizza (Blanche)',    icon: Pizza      },
  { name: 'Boissons',           icon: CupSoda    },
  { name: 'Jus Naturels',       icon: Droplet    },
  { name: 'Milkshakes',         icon: IceCream   },
  { name: 'Boissons Chaudes',   icon: Coffee     },
  { name: 'Boissons Froides',   icon: Snowflake  },
  { name: 'Bubbles',            icon: Soup       },
  { name: 'Crêpes',             icon: Donut      },
  { name: 'Pancakes',           icon: Donut      },
  { name: 'Desserts',           icon: IceCream   },
  { name: 'Glaces',             icon: IceCream   },
];

export default function MenuPage() {
  const [menuItems, setMenuItems]       = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedCategory, setCategory] = useState('All');
  const [selectedId, setSelectedId]     = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', category: '', price: '', isPizza: false });

  // Load menu on mount
  useEffect(() => {
    window.api.fetchMenu()
      .then(items => setMenuItems(items))
      .catch(err => console.error('Échec du chargement du menu :', err));
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    return menuItems.filter(item => {
      const byCat    = selectedCategory === 'All' || item.category === selectedCategory;
      const bySearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return byCat && bySearch;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // Add new item via backend
  const handleAddSave = (newItem) => {
    // override description
    const payload = { ...newItem, description: 'descp' };
    window.api.createMenu(payload)
      .then(created => {
        setMenuItems(prev => [...prev, created]);
        setShowAddModal(false);
      })
      .catch(err => console.error("Échec de l'ajout :", err));
  };

  // Delete selected
  const handleDelete = () => {
    if (!selectedId) return;
    window.api.deleteMenu(selectedId)
      .then(() => {
        setMenuItems(prev => prev.filter(i => i.id !== selectedId));
        setSelectedId(null);
      })
      .catch(err => console.error('Échec de la suppression :', err));
  };

  // Open edit modal
  const handleOpenEdit = () => {
    if (!selectedId) return;
    const item = menuItems.find(i => i.id === selectedId);
    if (!item) return;
    setEditForm({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      isPizza: item.isPizza
    });
    setShowEditModal(true);
  };

  // Save edits via backend
  const handleEditSave = (e) => {
    e.preventDefault();
    const { id, name, category, price, isPizza } = editForm;
    // use hard-coded description
    window.api.updateMenu({ id, name, category, price: parseFloat(price), description: 'descp', isPizza })
      .then(updated => {
        setMenuItems(prev => prev.map(i => i.id === id ? updated : i));
        setShowEditModal(false);
        setSelectedId(null);
      })
      .catch(err => console.error("Échec de la mise à jour :", err));
  };

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6 bg-white overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Menu</h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des éléments du menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E71FF]"
            />
          </div>

          {/* Categories */}
          <div className="flex space-x-2 mb-6 overflow-x-auto flex-wrap gap-2 overflow-y-hidden">
            {categories.map(({ name, icon: Icon }) => (
              <motion.button
                key={name}
                onClick={() => setCategory(name)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 h-12 rounded-full font-medium transition-all transform whitespace-nowrap
                  ${selectedCategory === name
                    ? 'bg-[#4E71FF] text-white scale-105'
                    : 'bg-gray-200 text-[#1D150B] hover:bg-[#ffe6d8] hover:scale-105'}
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {name}
              </motion.button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                whileTap={{ scale: 0.97 }}
                className={`cursor-pointer bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow flex flex-col justify-between
                  ${selectedId === item.id ? 'ring-4 ring-[#4E71FF]/50' : ''}
                `}
              >
                <div>
                  <h3 className="text-2xl font-semibold text-[#1D150B] mb-2">{item.name}</h3>
                  {/* description removed */}
                </div>
                <span className="text-xl font-bold text-[#4E71FF]">{item.price} D.A</span>
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
            className="mb-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#4E71FF] text-white font-medium"
          >
            <Plus size={18} /> Ajouter un élément
          </motion.button>
          <motion.button
            onClick={handleOpenEdit}
            whileHover={{ scale: selectedId ? 1.03 : 1 }}
            whileTap={{ scale: selectedId ? 0.97 : 1 }}
            disabled={!selectedId}
            className={`mb-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg
              ${selectedId
                ? 'bg-white text-[#1D150B] border border-[#4E71FF] hover:bg-[#FAF0E6]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              font-medium transition-colors
            `}
          >
            <PencilOff size={18} /> Modifier la sélection
          </motion.button>
          <motion.button
            onClick={handleDelete}
            whileHover={{ scale: selectedId ? 1.03 : 1 }}
            whileTap={{ scale: selectedId ? 0.97 : 1 }}
            disabled={!selectedId}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg
              ${selectedId
                ? 'bg-white text-[#1D150B] border border-[#4E71FF] hover:bg-[#FFEDE3]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              font-medium transition-colors
            `}
          >
            <Trash2 size={18} /> Supprimer la sélection
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
              <h2 className="text-2xl font-bold mb-4 text-[#1D150B]">Ajouter un élément de menu</h2>

              <form onSubmit={e => {
                e.preventDefault();
                const f = e.target;
                handleAddSave({
                  name:     f.name.value,
                  category: f.category.value,
                  price:    parseFloat(f.price.value),
                  isPizza:  f.isPizza.checked
                });
                f.reset();
              }} className="space-y-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPizza" className="h-4 my-2  w-4"/>
                  <span>Pizza </span>
                </label>
                <input name="name" placeholder="Nom" required className="w-full border rounded-lg px-3 my-2  py-2" />
                <select name="category" required className="w-full border rounded-lg px-3 py-2 my-2 ">
                  <option value="">Catégorie</option>
                  {categories.slice(1).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <input name="price" type="number" step="0.01" placeholder="Prix" required className="w-full my-2  border rounded-lg px-3 py-2" />
                {/* description field removed */}
                <button type="submit" className="w-full py-3 my-2  bg-[#4E71FF] text-white rounded-lg font-medium">Enregistrer</button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Item Modal */}
        {showEditModal && (
          <motion.div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 w-80 max-w-full relative"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-[#1D150B]">Modifier l'élément de menu</h2>

              <form onSubmit={handleEditSave} className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPizza"
                    checked={editForm.isPizza}
                    onChange={e => setEditForm(f => ({ ...f, isPizza: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <span>Pizza</span>
                </label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nom"
                  required
                  className="w-full my-2 border rounded-lg px-3 py-2"
                />
                <select
                  name="category"
                  value={editForm.category}
                  onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                  required
                  className="w-full my-2 border rounded-lg px-3 py-2"
                >
                  <option value="">Catégorie</option>
                  {categories.slice(1).map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="Prix"
                  required
                  className="w-full my-2 border rounded-lg px-3 py-2"
                />
                {/* description field removed */}
                <button type="submit" className="w-full my-2 py-3 bg-[#4E71FF] text-white rounded-lg font-medium">Enregistrer</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
