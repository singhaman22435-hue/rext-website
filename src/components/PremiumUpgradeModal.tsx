import React, { useState } from 'react';
import { PRICING_PLANS, PricingPlan, proService } from '../services/proService';
import confetti from 'canvas-confetti';
import {
  Crown,
  Check,
  X,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Key,
  Flame,
  Download,
  Sliders,
  Tv
} from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[1]);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [keyStatus, setKeyStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isAlreadyPro = proService.isPro();

  if (!isOpen) return null;

  const handleCheckout = async (plan: PricingPlan) => {
    setIsProcessing(true);
    // Simulate real gateway handshake (Razorpay / Stripe / Lemon Squeezy)
    setTimeout(() => {
      setIsProcessing(false);
      const genuineKey = proService.generateKeysBatch(1)[0];
      proService.activatePro(genuineKey);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF5500', '#FFD700', '#0066FF', '#22C55E']
      });
      if (onSuccess) onSuccess();
    }, 1200);
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const res = proService.validateAndActivateKey(licenseKeyInput);
    setKeyStatus(res);
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF5500', '#22C55E']
      });
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 md:p-8 space-y-6 my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-[var(--text-main)]">rext Pro Pass</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {isAlreadyPro ? 'ACTIVE' : 'VIP PASS'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Unlock 18dB Ultra Bass, Unlimited Offline Music & Studio DSP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAlreadyPro ? (
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500 text-white flex items-center justify-center shadow-md">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-[var(--text-main)]">You Are a Rext Pro Member!</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Your license is active on this device. You have full access to 18dB Bass Boost, Unlimited Downloads, and YouTube Video streaming.
            </p>
            <div className="text-xs font-mono text-[var(--text-sub)]">
              License: <span className="font-bold text-[var(--text-main)]">{proService.getLicenseKey() || 'VIP-LIFETIME'}</span>
            </div>
            <button
              onClick={() => {
                proService.deactivatePro();
                setKeyStatus(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Deactivate License
            </button>
          </div>
        ) : (
          <>
            {/* Feature Perks Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-1">
                <Flame className="w-5 h-5 text-[var(--accent-orange)] mx-auto" />
                <p className="text-xs font-bold text-[var(--text-main)]">+18 dB Ultra Bass</p>
                <p className="text-[10px] text-[var(--text-sub)]">DSP 32-bit punch</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-1">
                <Download className="w-5 h-5 text-[var(--accent-blue)] mx-auto" />
                <p className="text-xs font-bold text-[var(--text-main)]">Offline Vault</p>
                <p className="text-[10px] text-[var(--text-sub)]">Unlimited downloads</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-1">
                <Sliders className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-[var(--text-main)]">Studio 10-Band EQ</p>
                <p className="text-[10px] text-[var(--text-sub)]">Audiophile tuning</p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-1">
                <Tv className="w-5 h-5 text-red-500 mx-auto" />
                <p className="text-xs font-bold text-[var(--text-main)]">PiP Music Video</p>
                <p className="text-[10px] text-[var(--text-sub)]">Floating official video</p>
              </div>
            </div>

            {/* Pricing Plans Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-[var(--accent-orange)] bg-[var(--bg-surface)] shadow-md ring-2 ring-[var(--accent-orange)]/20'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-color-hover)]'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-[var(--accent-orange)] text-white shadow-sm">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-main)]">{plan.name}</h4>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-[var(--text-main)]">{plan.price}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{plan.period}</span>
                      </div>
                      {plan.originalPrice && (
                        <p className="text-[10px] text-[var(--text-sub)] line-through">
                          {plan.originalPrice}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                      {plan.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[var(--accent-orange)] flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Main Action Button */}
            <div className="space-y-3">
              <button
                onClick={() => handleCheckout(selectedPlan)}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting to Payment Gateway...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Unlock {selectedPlan.name} ({selectedPlan.price})
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[var(--text-sub)]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> 256-Bit Secure SSL
                </span>
                <span>•</span>
                <span>Supports UPI, Cards, Apple Pay & PayPal</span>
              </div>
            </div>

            {/* License Key Activation Section (For selling on Gumroad, WhatsApp, or Instagram) */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-color)] space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)]">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Already have a License Key or Coupon?</span>
              </div>
              <form onSubmit={handleActivateKey} className="flex gap-2">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => {
                    setLicenseKeyInput(e.target.value);
                    setKeyStatus(null);
                  }}
                  placeholder="e.g. REXT-PRO-2026-VIP"
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] uppercase font-mono placeholder-[var(--text-sub)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-orange)] text-xs font-bold text-[var(--text-main)] transition-colors"
                >
                  Activate
                </button>
              </form>
              {keyStatus && (
                <p className={`text-xs font-semibold ${keyStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                  {keyStatus.message}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default PremiumUpgradeModal;

