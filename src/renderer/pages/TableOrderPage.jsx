// src/pages/TableOrderPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Pizza, Sandwich, CupSoda, IceCream } from 'lucide-react';
import { motion } from 'framer-motion';
import OrderPanel from '../components/OrderPanel';

const categories = [
  { name: 'All',        icon: null     },
  { name: 'Pizza',      icon: Pizza    },
  { name: 'Sandwiches', icon: Sandwich },
  { name: 'Drinks',     icon: CupSoda  },
  { name: 'Desserts',   icon: IceCream },
];

export default function TableOrderPage({ table, onComplete, onCancel }) {
  const [menuItems, setMenuItems]     = useState([]);
  const [orderItems, setOrderItems]   = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedCategory, setCategory] = useState('All');

  // 1) Load menu once
  useEffect(() => {
    window.api.fetchMenu().then(setMenuItems).catch(console.error);
  }, []);

  // Add/remove
  const handleAddItem = item => {
    setOrderItems(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const handleRemoveItem = idx =>
    setOrderItems(prev => prev.filter((_, i) => i !== idx));

  // Finish
  const handleFinish = () => {
    const total = orderItems.reduce((s,i) => s + i.price*i.quantity, 0);
    onComplete({ tableNumber: table.tableNumber, items: orderItems, total });
  };

  // Filter menu
  const filteredMenu = useMemo(() => menuItems.filter(item => {
    const byCat    = selectedCategory==='All'||item.category===selectedCategory;
    const bySearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return byCat && bySearch;
  }), [menuItems, searchTerm, selectedCategory]);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 p-6 bg-white overflow-auto">
        <button
          onClick={onCancel}
          className="mb-6 bg-[#ED6827] text-white px-4 py-2 rounded-lg"
        >
          ← Back to Tables
        </button>

        <h1 className="text-2xl font-bold mb-4">Table {table.tableNumber} Order</h1>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED6827]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map(({ name, icon: Icon }) => (
            <motion.button
              key={name}
              onClick={() => setCategory(name)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium
                ${selectedCategory===name
                  ? 'bg-[#ED6827] text-white'
                  : 'bg-gray-200 text-[#1D150B] hover:bg-[#ffe6d8]'}
              `}
            >
              {Icon && <Icon className="w-5 h-5" />}
              {name}
            </motion.button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map(item => (
            <motion.div
              key={item.id}
              onClick={() => handleAddItem(item)}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div>
                <h3 className="text-2xl font-semibold text-[#1D150B] mb-2">{item.name}</h3>
                <p className="text-base text-gray-500 mb-4 flex-1">{item.description}</p>
              </div>
              <span className="text-xl font-bold text-[#ED6827]">${item.price.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <OrderPanel
        items={orderItems}
        onPlaceOrder={handleFinish}
        onCancel={onCancel}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}
