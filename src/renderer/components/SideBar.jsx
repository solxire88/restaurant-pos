// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  Coffee,
  UtensilsCrossed,
  BookOpen,
  Users,
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Sidebar() {
  const items = [
    { label: 'Home',      to: '/',         icon: HomeIcon       },
    { label: 'Take Away', to: '/takeaway', icon: Coffee         },
    { label: 'Dine In',   to: '/dinein',   icon: UtensilsCrossed},
    { label: 'Menu',      to: '/menu',     icon: BookOpen       },
    { label: 'Staff',     to: '/staff',    icon: Users          },
  ];

  return (
    <aside className="flex flex-col w-52 h-screen bg-[#F9F9F9] text-[#1D150B] shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-center h-24 border-b border-gray-200">
        <img src={logo} alt="Logo" className="h-12" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2">
          {items.map(({ label, to, icon: Icon }) => (
            <li key={label}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-4 px-6 py-4 rounded-lg text-lg transition-all
                   ${isActive
                     ? 'bg-[#ED6827] text-white font-semibold'
                     : 'text-[#1D150B] hover:bg-[#ED6827]/20 hover:text-[#ED6827]'
                   }`
                }
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center"
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className="flex-1">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
