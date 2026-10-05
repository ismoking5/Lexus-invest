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
  Link2,
  Sparkles,
  ExternalLink,
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

  // Compute automated referral URL using custom domain
  const getBaseDomain = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      const origin = window.location.origin;
      if (origin.includes('lexus-price.site')) {
        return 'https://lexus-price.site';
      }
      if (origin.includes('lexus-price.vercel.app')) {
        return 'https://lexus-price.vercel.app';
      }
      if (origin.includes('vercel.app')) {
        return origin;
      }
    }
    return 'https://lexus-price.vercel.app';
  };

  const baseUrl = getBaseDomain();
  const referralLink = `${baseUrl}/?ref=${currentUser.referralCode}`;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareText = `🚗 Rejoignez-moi sur LEXUS INVEST et recevez immédiatement 500 FCFA gratuits dès votre inscription !\n\nCliquez directement sur ce lien pour activer votre bonus :\n${referralLink}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Lexus Invest Club',
        text: shareText,
        url: referralLink,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🚗 Rejoignez LEXUS INVEST et recevez 500 FCFA gratuits immédiatement !')}`;
    window.open(url, '_blank');
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

      {/* Referral Card & Automated Link Box */}
      <div className="mx-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase tracking-wider">
              Lien de Parrainage Officiel
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Automatique
          </span>
        </div>

        {/* Explicative note */}
        <p className="text-[11px] text-neutral-300 leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          ⚡ <strong className="text-amber-400">100% Automatique :</strong> Vos amis n'ont plus besoin de recopier votre code ! En cliquant sur votre lien, ils sont immédiatement rattachés à votre équipe et reçoivent <strong>500 FCFA gratuits</strong>.
        </p>

        {/* Full Link Display & Copy */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              Lien direct à partager
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              Code : {currentUser.referralCode}
            </span>
          </label>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2">
            <div className="truncate font-mono text-xs text-amber-300 font-semibold select-all">
              {referralLink}
            </div>

            <button
              onClick={handleCopyLink}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-black'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le lien</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTelegram}
            className="py-2.5 px-3 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 text-[#0088cc] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Telegram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShare}
            className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partager tout</span>
          </button>
        </div>

        {/* Short Code fallback info */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <span>Code seul : <strong className="text-white font-mono">{currentUser.referralCode}</strong></span>
          <button
            onClick={handleCopyCode}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
          >
            {copiedCode ? 'Code copié ✓' : 'Copier le code seul'}
          </button>
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
