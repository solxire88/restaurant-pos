import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  Coffee,
  UtensilsCrossed,
  BookOpen,
  Users,
  BadgePercent,
  Settings as SettingsIcon,
  Power as PowerIcon, // new icon for quit
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Sidebar() {
  const [dateTime, setDateTime] = useState('');

  // Update date/time every second
  useEffect(() => {
    const two = n => n.toString().padStart(2, '0');
    const update = () => {
      const now = new Date();
      const dateStr = [two(now.getDate()), two(now.getMonth() + 1), now.getFullYear()].join('/');
      const timeStr = [two(now.getHours()), two(now.getMinutes()), two(now.getSeconds())].join(':');
      setDateTime(`${dateStr} ${timeStr}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: 'Accueil', to: '/', icon: HomeIcon },
    { label: 'À emporter', to: '/takeaway', icon: Coffee },
    { label: 'Sur place', to: '/dinein', icon: UtensilsCrossed },
    { label: 'Menu', to: '/menu', icon: BookOpen },
    { label: 'Personnel', to: '/staff', icon: Users },
    { label: 'Ventes', to: '/sales', icon: BadgePercent },
    { label: 'Paramètres', to: '/settings', icon: SettingsIcon },
  ];

  const handleQuit = () => {
    if (window.api && typeof window.api.quitApp === 'function') {
      window.api.quitApp();
    }
  };

  return (
    <aside className="flex flex-col w-52 h-screen bg-[#F9F9F9] text-[#1D150B] shadow-2xl">
      {/* Logo and Date/Time */}
      <div className="flex flex-col items-center justify-center h-28 border-b border-gray-200">
        <img src={logo} alt="Logo" className="h-20" />
        <span className="mt-1 text-sm text-gray-500">{dateTime}</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2">
          {items.map(({ label, to, icon: Icon }) => (
            <li key={label}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-4 px-6 py-3 rounded-lg text-lg transition-all
                   ${isActive
                     ? 'bg-[#4E71FF] text-white font-semibold'
                     : 'text-[#1D150B] hover:bg-[#4E71FF]/20 hover:text-[#4E71FF]'
                   }`
                }
              >
                <motion.div whileTap={{ scale: 0.9 }} className="flex items-center">
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className="flex-1">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quit button at bottom */}
      <div className="border-t flex justify-center border-gray-200 p-2">
        <button
          onClick={handleQuit}
          className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <PowerIcon className="w-5 h-5" />
          Quitter
        </button>
      </div>
    </aside>
  );
}
