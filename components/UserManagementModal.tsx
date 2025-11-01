import React, { useState } from 'react';
import { User, Role } from '../types';
import { TrashIcon, EditIcon, CheckIcon, CloseIcon } from './icons';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';

interface UserManagementPanelProps {
  users: User[];
  // setUsers is no longer needed as we write directly to Firestore
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ users }) => {
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ role: Role }>({ role: Role.MateHost });
  const [error, setError] = useState('');
  
  const handleStartEdit = (user: User) => {
    setEditingUsername(user.username);
    setEditFormData({ role: user.role });
  };

  const handleCancelEdit = () => {
    setEditingUsername(null);
  };

  const handleSaveEdit = async (userId: string) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { role: editFormData.role });
    setEditingUsername(null);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"? Esto solo eliminará el perfil de la app, no la cuenta de inicio de sesión.`)) {
        await deleteDoc(doc(db, 'users', userId));
    }
  };
  
  // Note: Adding users requires creating them in Firebase Authentication first.
  // This form only adds their profile to the Firestore database.
  const handleAddUserProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      alert("Para agregar un nuevo usuario, primero debe crearlo en la Consola de Firebase Authentication, luego agregar su perfil aquí.");
  }

  const RoleSelect: React.FC<{ value: Role, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, disabled?: boolean }> = ({ value, onChange, disabled }) => (
     <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    >
        {Object.values(Role).map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
    </select>
  );

  return (
    <div>
        <div className="space-y-4 my-6 max-h-[40vh] overflow-y-auto p-1 pr-4">
        {users.map(user => (
            <div key={user.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg transition-shadow flex items-center justify-between">
            {editingUsername === user.username ? (
                <>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{user.username}</span>
                    <RoleSelect value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })} />
                </div>
                <div className="flex space-x-2 ml-4">
                    <button onClick={handleCancelEdit} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><CloseIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleSaveEdit(user.id!)} className="p-2 text-green-500 hover:text-green-700 dark:hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
                </div>
                </>
            ) : (
                <>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">{user.username}</span>
                    <span className="text-sm capitalize px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300">{user.role}</span>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => handleStartEdit(user)} className="p-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteUser(user.id!, user.username)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                </div>
                </>
            )}
            </div>
        ))}
        </div>
        
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Gestión de Usuarios</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Para agregar o eliminar completamente un usuario, por favor utiliza la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Consola de Firebase Authentication</a>.
                Aquí puedes gestionar los roles de los perfiles de usuario existentes.
            </p>
        </div>
    </div>
  );
};

export default UserManagementPanel;