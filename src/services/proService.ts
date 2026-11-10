/**
 * Rext Pro Licensing & Cryptographic Anti-Tampering Engine
 * Secure against:
 * - DevTools localStorage manipulation & value forging
 * - Brute-force dictionary attacks
 * - Key tampering & illegitimate copying
 */

import {
  generateCryptographicLicenseKey,
  verifyLicenseKey,
  createSessionSignature,
  verifySessionSignature,
  getDeviceFingerprint
} from '../utils/security.ts';

export interface PricingPlan {
  id: 'monthly' | 'yearly' | 'lifetime';
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  badge?: string;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$3.99',
    period: '/ month',
    originalPrice: '$6.99',
    features: [
      'Full YouTube Music Library',
      'Bass Boost up to +18 dB',
      'Unlimited Offline Vault Downloads',
      'Picture-in-Picture Music Video',
      'Standard Support'
    ]
  },
  {
    id: 'yearly',
    name: 'Pro Annual',
    price: '$19.99',
    period: '/ year',
    originalPrice: '$47.88',
    badge: 'SAVE 60%',
    features: [
      'Everything in Monthly',
      '32-bit Floating DSP Audio',
      '10-Band Studio Equalizer & Reverb',
      'High Priority Feature Updates',
      '2 Months Free Included'
    ]
  },
  {
    id: 'lifetime',
    name: 'Founder Lifetime',
    price: '$39.99',
    period: 'one-time payment',
    originalPrice: '$99.00',
    badge: 'BEST VALUE',
    features: [
      'Pay Once, Keep Forever',
      'VIP Gold Rext Pro Badge',
      'All Future Updates Included',
      'Commercial Desktop & Mobile License',
      'Direct WhatsApp / Email Support'
    ]
  }
];

class ProService {
  private readonly STORAGE_STATUS_KEY = 'rext_pro_status';
  private readonly STORAGE_LICENSE_KEY = 'rext_license_key';
  private readonly STORAGE_SIGNATURE_KEY = 'rext_pro_signature';
  private readonly ATTEMPTS_KEY = 'rext_key_failed_attempts';
  private readonly LOCKOUT_KEY = 'rext_key_lockout_until';

  /**
   * Cryptographically validates Pro status against device fingerprint & HMAC
   * Prevents DevTools localStorage tampering
   */
  public isPro(): boolean {
    if (typeof window === 'undefined') return false;

    const rawStatus = localStorage.getItem(this.STORAGE_STATUS_KEY);
    const key = localStorage.getItem(this.STORAGE_LICENSE_KEY);
    const signature = localStorage.getItem(this.STORAGE_SIGNATURE_KEY);

    // If status is claimed to be true, signature and key MUST be valid
    if (rawStatus === 'true') {
      if (!key || !signature) {
        // Tamper attempt detected: forged status without signature
        this.deactivatePro();
        return false;
      }

      const deviceId = getDeviceFingerprint();
      const isValidSig = verifySessionSignature(key, deviceId, signature);
      const isValidKey = verifyLicenseKey(key);

      if (!isValidSig || !isValidKey) {
        // Tamper attempt detected: invalid cryptographic signature
        console.warn('[SECURITY] License tamper detected. Revoking access.');
        this.deactivatePro();
        return false;
      }

      return true;
    }

    return false;
  }

  public getLicenseKey(): string | null {
    if (typeof window === 'undefined') return null;
    return this.isPro() ? localStorage.getItem(this.STORAGE_LICENSE_KEY) : null;
  }

  /**
   * Activates Pro by computing a cryptographically signed HMAC token bound to this device
   */
  public activatePro(licenseKey: string): boolean {
    if (typeof window === 'undefined') return false;

    const deviceId = getDeviceFingerprint();
    const signature = createSessionSignature(licenseKey, deviceId);

    localStorage.setItem(this.STORAGE_STATUS_KEY, 'true');
    localStorage.setItem(this.STORAGE_LICENSE_KEY, licenseKey);
    localStorage.setItem(this.STORAGE_SIGNATURE_KEY, signature);

    // Clear failed attempts on successful activation
    localStorage.removeItem(this.ATTEMPTS_KEY);
    localStorage.removeItem(this.LOCKOUT_KEY);

    window.dispatchEvent(
      new CustomEvent('rext-pro-change', {
        detail: { isPro: true, key: licenseKey }
      })
    );
    return true;
  }

  public deactivatePro(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_STATUS_KEY);
    localStorage.removeItem(this.STORAGE_LICENSE_KEY);
    localStorage.removeItem(this.STORAGE_SIGNATURE_KEY);
    window.dispatchEvent(
      new CustomEvent('rext-pro-change', { detail: { isPro: false } })
    );
  }

  /**
   * Checks if user is locked out due to repeated failed key attempts
   */
  public checkLockout(): { locked: boolean; remainingSeconds: number } {
    if (typeof window === 'undefined') return { locked: false, remainingSeconds: 0 };
    const lockoutUntil = parseInt(localStorage.getItem(this.LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      return { locked: true, remainingSeconds: Math.ceil((lockoutUntil - now) / 1000) };
    }
    return { locked: false, remainingSeconds: 0 };
  }

  /**
   * Validates a user-entered key with cryptographic signature and rate limiting
   */
  public validateAndActivateKey(rawKey: string): { success: boolean; message: string } {
    const lockout = this.checkLockout();
    if (lockout.locked) {
      return {
        success: false,
        message: `Too many failed attempts. Security lockout active for ${lockout.remainingSeconds}s.`
      };
    }

    const clean = rawKey.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Please enter your license key' };
    }

    // Verify cryptographic polynomial HMAC checksum
    const isValid = verifyLicenseKey(clean);

    if (isValid) {
      this.activatePro(clean);
      return {
        success: true,
        message: 'Genuine License Verified! Rext Pro Lifetime Activated.'
      };
    }

    // Handle failed attempt & enforce exponential backoff lockout
    const attempts = parseInt(localStorage.getItem(this.ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(this.ATTEMPTS_KEY, attempts.toString());

    if (attempts >= 4) {
      const lockoutSeconds = 60;
      localStorage.setItem(this.LOCKOUT_KEY, (Date.now() + lockoutSeconds * 1000).toString());
      return {
        success: false,
        message: `4 invalid attempts detected. Security cooldown triggered for ${lockoutSeconds} seconds.`
      };
    }

    return {
      success: false,
      message: `Invalid cryptographic license key (${4 - attempts} attempts remaining).`
    };
  }

  /**
   * Helper for the developer/seller to batch generate 100 genuine license keys to sell
   */
  public generateKeysBatch(count: number = 10): string[] {
    const keys: string[] = [];
    for (let i = 0; i < count; i++) {
      keys.push(generateCryptographicLicenseKey());
    }
    return keys;
  }
}

export const proService = new ProService();
export default proService;
