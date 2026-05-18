import { useUserSettings } from '@/lib/UserSettingsContext';

/**
 * Returns subscription tier and helper flags.
 * tier: 'free' | 'premium' | 'family'
 * isPremium: true for premium + family
 * isFamily: true only for family
 * canAccess(feature): 'analytics' | 'family' | 'vault' | 'reviews'
 */
export function useSubscription() {
  const { settings } = useUserSettings();
  const tier = settings?.subscription_tier || 'free';

  const isPremium = tier === 'premium' || tier === 'family';
  const isFamily  = tier === 'family';

  const FEATURE_TIERS = {
    analytics: ['premium', 'family'],
    reviews:   ['premium', 'family'],
    vault:     ['premium', 'family'],
    family:    ['family'],
  };

  const canAccess = (feature) => {
    const allowed = FEATURE_TIERS[feature] || [];
    return allowed.includes(tier);
  };

  return { tier, isPremium, isFamily, canAccess };
}