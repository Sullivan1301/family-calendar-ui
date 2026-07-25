'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          toast.error('Le nom est obligatoire');
          return;
        }
        result = await register(formData.email, formData.password, formData.name);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isLogin ? 'Connexion réussie !' : 'Compte créé avec succès !');
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tba-blue mx-auto"></div>
          <p className="mt-4 text-tba-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tba-blue/5 to-tba-cyan/5 px-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-tba-blue text-white mb-4">
            <Calendar size={40} />
          </div>
          <h1 className="text-3xl font-bold text-tba-blue">Family Calendar</h1>
          <p className="text-tba-gray mt-2">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom (register uniquement) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-tba-gray mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tba-gray-light" size={20} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-tba-border focus:border-tba-blue outline-none transition-colors"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-tba-gray mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tba-gray-light" size={20} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-tba-border focus:border-tba-blue outline-none transition-colors"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-tba-gray mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tba-gray-light" size={20} />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-tba-border focus:border-tba-blue outline-none transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tba-blue text-white py-3 rounded-xl font-bold hover:bg-tba-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Chargement...'
                : isLogin
                ? 'Se connecter'
                : 'Créer mon compte'}
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-tba-gray">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-tba-blue font-bold hover:underline"
              >
                {isLogin ? "S'inscrire" : 'Se connecter'}
              </button>
            </p>
          </div>
        </div>

        {/* Lien vers accueil */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-tba-gray hover:text-tba-blue transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
