import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      setLoading(false);
      return;
    }
    try {
      // Iniciar sesión con el correo electrónico exacto que ingresa el usuario
      await signInWithEmailAndPassword(auth, email, password);
      // El cambio de estado de autenticación será manejado por el listener en App.tsx
    } catch (err: any) {
      setError('Correo o contraseña inválidos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Matehost Shifts Scheduler
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Por favor, inicia sesión para continuar
            </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: sabri@email.com"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******************"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
         <p className="text-center text-gray-500 text-xs">
          &copy;{new Date().getFullYear()} Shift Scheduler. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;