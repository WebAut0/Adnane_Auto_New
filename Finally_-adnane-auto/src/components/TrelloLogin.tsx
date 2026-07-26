/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface TrelloLoginProps {
  lang: 'ar' | 'fr';
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function TrelloLogin({ lang, onLoginSuccess, onBack }: TrelloLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('adnane_admin_token', data.token);
          onLoginSuccess();
        } else {
          setError(
            lang === 'ar' 
              ? 'رمز الجلسة غير صالح، الرجاء المحاولة مجدداً.' 
              : 'Jeton de session non valide.'
          );
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(
          errData.error || 
          (lang === 'ar' 
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة!' 
            : 'Email ou mot de passe incorrect !')
        );
      }
    } catch (err) {
      setError(
        lang === 'ar' 
          ? 'عذراً، فشل الاتصال بخادم الأمان. يرجى المحاولة لاحقاً.' 
          : 'Échec de connexion au serveur de sécurité. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div 
      id="trello-login-screen" 
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 md:p-10 relative"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 min-h-[550px] border border-gray-100">
        
        {/* Left Side: Login Form */}
        <div className="md:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Back Button */}
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-500 transition cursor-pointer mb-8"
            >
              <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
              <span>{lang === 'ar' ? 'الرجوع للموقع' : 'Retour au site'}</span>
            </button>

            {/* Title / Header */}
            <div className="mb-8">
              <BrandLogo variant="light" height="52px" className="!justify-start mb-2" />
              <p className="text-xs text-gray-400 mt-1.5">
                {lang === 'ar' ? 'تسجيل الدخول للوحة التحكم والمخزون' : 'Accéder à l\'espace gestion & stock'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs mb-6 border border-rose-100 font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse e-mail'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-gray-400`}>
                    <Mail className="h-4 w-4" />
                  </span>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-3 px-4 text-sm text-gray-800 transition font-medium"
                    placeholder="adnaneauto@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-gray-400`}>
                    <Lock className="h-4 w-4" />
                  </span>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-3 px-4 text-sm text-gray-800 transition font-medium"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-500">
                  <input type="checkbox" className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 border-gray-200" defaultChecked />
                  <span>{lang === 'ar' ? 'تذكرني' : 'Se souvenir de moi'}</span>
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-100 transition-all duration-200 cursor-pointer text-sm mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{lang === 'ar' ? 'جاري التحقق الأمني...' : 'Validation sécurisée...'}</span>
                  </>
                ) : (
                  <span>{lang === 'ar' ? 'دخول لوحة التحكم' : 'Se connecter'}</span>
                )}
              </button>
            </form>
          </div>

          <div className="text-[10px] text-gray-400 mt-8 pt-4 border-t border-gray-50 text-center font-medium">
            {lang === 'ar' ? 'لوحة التحكم الخاصة بإدارة معرض عدنان أوتو' : 'Espace d\'administration Adnane Auto'}
          </div>
        </div>

        {/* Right Side: Hero Visual */}
        <div className="hidden md:flex md:col-span-7 relative bg-gray-900 justify-center items-center p-12 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" 
              alt="Premium Car" 
              className="w-full h-full object-cover opacity-60 transform scale-105"
            />
            {/* Pink overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/60 via-slate-900/75 to-slate-950/80"></div>
          </div>

          {/* Glassmorphism card floating over the image */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl max-w-md w-full shadow-2xl text-white">
            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold mb-3 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>{lang === 'ar' ? 'حصرياً بمراكش' : 'Exclusivité Marrakech'}</span>
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight mb-4">
              {lang === 'ar' ? 'خطط لمشوارك القادم بكل ثقة.' : 'Planifiez votre prochain voyage.'}
            </h2>
            
            <p className="text-xs text-slate-200 leading-relaxed mb-6 font-medium">
              {lang === 'ar' 
                ? 'لوحة إدارة عدنان أوتو تسمح لك بإدارة مخزون السيارات، وتحديث الطلبات، وجدول مواعيد زيارة المعرض بكل بساطة وسلاسة.' 
                : 'La plateforme de gestion d\'Adnane Auto vous permet d\'organiser vos véhicules, de suivre les demandes de reprise et de planifier les rendez-vous clients avec fluidité.'}
            </p>

            <div className="flex items-center gap-4 border-t border-white/10 pt-4 text-xs">
              <div>
                <p className="text-gray-300">{lang === 'ar' ? 'التقييم' : 'Note'}</p>
                <p className="font-bold text-lg text-rose-300">4.6 / 5.0</p>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div>
                <p className="text-gray-300">{lang === 'ar' ? 'الزبائن' : 'Clients'}</p>
                <p className="font-bold text-lg text-rose-300">5000+</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
