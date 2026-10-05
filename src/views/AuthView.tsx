import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Gift,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { ALLOWED_COUNTRIES, AllowedCountry } from '../types';
import { LEXUS_IMAGES } from '../assets/images';

export const AuthView: React.FC = () => {
  const { loginUser, registerUser } = useLexus();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedCountryName, setSelectedCountryName] = useState<AllowedCountry>("Côte d'Ivoire");
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentCountry = ALLOWED_COUNTRIES.find((c) => c.name === selectedCountryName) || ALLOWED_COUNTRIES[2];

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setErrorMsg('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }
    if (!password || password.trim().length < 3) {
      setErrorMsg('Veuillez renseigner votre mot de passe.');
      return;
    }

    const res = loginUser(phoneNumber.trim(), selectedCountryName, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Erreur lors de la connexion.');
    }
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setErrorMsg('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }
    if (!password || password.trim().length < 3) {
      setErrorMsg('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les deux mots de passe ne correspondent pas.');
      return;
    }

    const res = registerUser({
      fullName: fullName.trim() || 'Membre VIP Lexus',
      phone: phoneNumber.trim(),
      country: selectedCountryName,
      countryCode: currentCountry.code,
      password: password.trim(),
      referralCodeInput: referralCodeInput.trim() || undefined,
    });

    if (!res.success) {
      setErrorMsg(res.error || "Impossible d'effectuer l'inscription.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Lexus Brand Header */}
      <div className="text-center space-y-3 mb-6">
        <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-500/70 p-1 shadow-2xl bg-neutral-900">
          <img
            src={LEXUS_IMAGES.emblemLuxury}
            alt="Lexus Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div>
          <h1 className="font-['Cinzel',serif] text-2xl font-black tracking-widest text-white uppercase">
            LEXUS INVEST
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mt-0.5">
            Espace Sécurisé d'Investissement Mobile
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-5">
        {/* Tab switchers: Connexion vs Inscription */}
        <div className="flex border border-neutral-800 bg-neutral-950 rounded-2xl p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Connexion</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inscription (+500F)</span>
          </button>
        </div>

        {/* Free 500 FCFA Bonus Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-neutral-950 to-neutral-950 border border-amber-500/30 flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <p className="text-neutral-300 text-[11px] leading-snug">
            <strong className="text-amber-300">500 FCFA offerts immédiatement</strong> à la création de votre compte personnel protégé par mot de passe.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode: CONNEXION */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Sélection du Pays Autorisé */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Pays de résidence (5 pays autorisés)</span>
                <span className="text-amber-400 font-mono text-[10px]">{currentCountry.code}</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {ALLOWED_COUNTRIES.map((c) => (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => setSelectedCountryName(c.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      selectedCountryName === c.name
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-sm'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-mono text-neutral-400">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
                Numéro Mobile Money (sans indicatif)
              </label>
              <div className="flex">
                <span className="px-3.5 py-3 rounded-l-xl bg-neutral-800 border border-r-0 border-neutral-700 text-neutral-300 font-mono text-xs flex items-center">
                  {currentCountry.code}
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={`Ex : ${currentCountry.phonePlaceholder}`}
                  className="flex-1 px-4 py-3 rounded-r-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Mot de passe de connexion */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white text-sm outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Connexion</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                Nouveau sur Lexus ? <strong className="text-amber-400 underline">Créer un compte (+500F offerts)</strong>
              </button>
            </div>
          </form>
        )}

        {/* Mode: INSCRIPTION */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Nom et Prénom */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
                Nom et Prénom
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex : Koffi Jean-Luc"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
              />
            </div>

            {/* Pays Autorisé */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Pays de résidence (5 pays autorisés)</span>
                <span className="text-amber-400 font-mono text-[10px]">{currentCountry.code}</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {ALLOWED_COUNTRIES.map((c) => (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => setSelectedCountryName(c.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      selectedCountryName === c.name
                        ? 'border-amber-500 bg-amber-500/15 text-white shadow-sm'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-mono text-neutral-400">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
                Numéro Mobile Money (sans indicatif)
              </label>
              <div className="flex">
                <span className="px-3.5 py-3 rounded-l-xl bg-neutral-800 border border-r-0 border-neutral-700 text-neutral-300 font-mono text-xs flex items-center">
                  {currentCountry.code}
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={`Ex : ${currentCountry.phonePlaceholder}`}
                  className="flex-1 px-4 py-3 rounded-r-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
                Créer un mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 4 caractères"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 text-white text-sm outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmer le Mot de passe */}
            <div className="space-y-1.5">
              <label className="block text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez votre mot de passe"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 text-white text-sm outline-none transition-colors"
              />
            </div>

            {/* Code de parrainage (Optionnel) */}
            <div className="space-y-1.5">
              <label className="block text-neutral-400 font-medium text-[11px]">
                Code d'invitation / Parrainage (Optionnel)
              </label>
              <input
                type="text"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                placeholder="Ex : LEXUS225"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400 font-mono uppercase text-xs outline-none focus:border-neutral-600"
              />
            </div>

            {/* Bouton Inscription */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Créer mon compte & Recevoir 500 FCFA</span>
              <Gift className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                Déjà inscrit ? <strong className="text-amber-400 underline">Se connecter</strong>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
