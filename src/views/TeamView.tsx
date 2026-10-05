import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';

export const TeamView: React.FC = () => {
  const { currentUser, users, settings } = useLexus();
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  // Calculate referrals
  const level1Users = users.filter((u) => u.referredBy === currentUser.referralCode);
  const level1Codes = level1Users.map((u) => u.referralCode);
  const level2Users = users.filter((u) => u.referredBy && level1Codes.includes(u.referredBy));
  const level2Codes = level2Users.map((u) => u.referralCode);
  const level3Users = users.filter((u) => u.referredBy && level2Codes.includes(u.referredBy));

  const totalTeamSize = level1Users.length + level2Users.length + level3Users.length;

  const shareUrl = `${window.location.origin}/?ref=${currentUser.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Lexus Invest Club',
        text: `Rejoignez-moi sur Lexus Invest et recevez 500 FCFA gratuits dès votre inscription avec mon code : ${currentUser.referralCode}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Top Lexus Header Banner (Requirement 7) */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-36 sm:h-40 w-full">
          <img
            src={LEXUS_IMAGES.rxSport}
            alt="Lexus Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-neutral-100">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Programme Partenaires & Affiliation
            </span>
            <h2 className="font-['Cinzel',serif] text-xl font-bold uppercase tracking-wider text-white">
              Mon Réseau Lexus
            </h2>
            <p className="text-xs text-neutral-300">
              Gagnez {settings.referralLevel1Pct}% / {settings.referralLevel2Pct}% / {settings.referralLevel3Pct}% sur chaque investissement de vos filleuls.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Card & Code Box */}
      <div className="mx-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase tracking-wider">
              Votre Code d'Invitation
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
            Actif
          </span>
        </div>

        {/* Code Display */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
          <div>
            <span className="text-[10px] uppercase text-neutral-400 font-semibold block">
              Code de parrainage
            </span>
            <span className="font-['JetBrains_Mono',monospace] text-xl font-black text-amber-400 tracking-wider">
              {currentUser.referralCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
              title="Copier le code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-black font-bold text-xs cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager</span>
            </button>
          </div>
        </div>

        {/* Commission Tier Boxes */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-amber-400 font-bold block uppercase">Niveau 1</span>
            <span className="text-base font-bold font-mono text-white block">
              {settings.referralLevel1Pct}%
            </span>
            <span className="text-[10px] text-neutral-400 block">{level1Users.length} membre(s)</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold block uppercase">Niveau 2</span>
            <span className="text-base font-bold font-mono text-white block">
              {settings.referralLevel2Pct}%
            </span>
            <span className="text-[10px] text-neutral-400 block">{level2Users.length} membre(s)</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-purple-400 font-bold block uppercase">Niveau 3</span>
            <span className="text-base font-bold font-mono text-white block">
              {settings.referralLevel3Pct}%
            </span>
            <span className="text-[10px] text-neutral-400 block">{level3Users.length} membre(s)</span>
          </div>
        </div>

        {/* Welcome Bonus Notice */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
          <Gift className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <p className="leading-snug">
            Chaque ami qui s'inscrit avec votre code reçoit immédiatement <strong className="text-white">500 FCFA offerts</strong> pour démarrer.
          </p>
        </div>
      </div>

      {/* Network Members List */}
      <div className="mx-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-['Cinzel',serif] text-xs font-bold text-white uppercase tracking-wider">
            Membres de Niveau 1 Direct ({level1Users.length})
          </h4>
          <span className="text-[11px] text-neutral-400 font-mono">Total réseau : {totalTeamSize}</span>
        </div>

        {level1Users.length === 0 ? (
          <div className="py-6 text-center text-neutral-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-neutral-600 opacity-60" />
            <p className="text-xs">Vous n'avez pas encore de filleul direct.</p>
            <p className="text-[11px] text-neutral-400">Partagez votre code pour toucher 25% de commission dès leur premier investissement !</p>
          </div>
        ) : (
          <div className="space-y-2">
            {level1Users.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-neutral-200">{u.fullName}</h5>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {u.country} · {u.countryCode} {u.phone}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                    Niveau 1
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
