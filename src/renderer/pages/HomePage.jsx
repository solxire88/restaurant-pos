import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, UtensilsCrossed, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      when: 'beforeChildren',
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300 } },
  hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400 } },
};

export default function HomePage() {
  const navigate = useNavigate();
  const buttons = [
    { label: 'Take Away', icon: <Coffee size={48} />, href: '/takeaway' },
    { label: 'Dine In', icon: <UtensilsCrossed size={48} />, href: '/dinein' },
    { label: 'Menu', icon: <BookOpen size={48} />, href: '/menu' },
    { label: 'Staff', icon: <Users size={48} />, href: '/staff' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center py-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-6 flex flex-col items-center"
      >
        <img src={logo} alt="Logo" className="h-20" />
        <div className="h-1 w-24 bg-[#ED6827] mt-2 rounded-full" />
      </motion.header>
      <motion.main
        className="grid grid-cols-2 gap-8 px-4 w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {buttons.map((btn) => (
          <motion.button
            key={btn.label}
            onClick={() => navigate(btn.href)}
            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-6 h-48 border-2 border-transparent hover:border-[#ED6827] transition-border duration-200"
            variants={buttonVariants}
            whileHover="hover"
          >
            <motion.div className="text-[#ED6827] mb-4" layout>
              {btn.icon}
            </motion.div>
            <motion.span className="text-[#1D150B] text-xl font-medium" layout>
              {btn.label}
            </motion.span>
          </motion.button>
        ))}
      </motion.main>
    </div>
  );
}