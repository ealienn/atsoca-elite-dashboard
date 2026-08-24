/**
 * Atsoca Elite Matrix 2026 Engine
 * Memo 1: Atsoca Elite Matrix 2026 Computation Engine
 */

export const UNIT_VALUATION = 4500; // 1 Unit = ₱4,500 Training Fee

export const ELITE_LEVELS = [
  { name: 'Bronze', minUnits: 1, maxUnits: 50, icon: 'fa-award', badgeColor: '#b45309', bgLight: '#fef3c7' },
  { name: 'Silver', minUnits: 51, maxUnits: 100, icon: 'fa-medal', badgeColor: '#64748b', bgLight: '#f1f5f9' },
  { name: 'Gold', minUnits: 101, maxUnits: 150, icon: 'fa-crown', badgeColor: '#eab308', bgLight: '#fef9c3' },
  { name: 'Platinum', minUnits: 151, maxUnits: 200, icon: 'fa-gem', badgeColor: '#0ea5e9', bgLight: '#e0f2fe' },
  { name: 'Diamond', minUnits: 201, maxUnits: 350, icon: 'fa-diamond', badgeColor: '#8b5cf6', bgLight: '#f3e8ff' },
  { name: 'Associate', minUnits: 351, maxUnits: 1500, icon: 'fa-user-shield', badgeColor: '#2563eb', bgLight: '#dbeafe' },
  { name: 'Associate Manager', minUnits: 1501, maxUnits: Infinity, icon: 'fa-user-tie', badgeColor: '#059669', bgLight: '#d1fae5' }
];

export const MATRIX_RATES = {
  'Bronze':            { bracket1: 0.08, bracket2: 0.10, bracket3: 0.12, bracket4: 0.16 },
  'Silver':            { bracket1: 0.08, bracket2: 0.10, bracket3: 0.13, bracket4: 0.17 },
  'Gold':              { bracket1: 0.08, bracket2: 0.10, bracket3: 0.14, bracket4: 0.18 },
  'Platinum':          { bracket1: 0.08, bracket2: 0.10, bracket3: 0.15, bracket4: 0.19 },
  'Diamond':           { bracket1: 0.09, bracket2: 0.12, bracket3: 0.16, bracket4: 0.20 },
  'Associate':         { bracket1: 0.10, bracket2: 0.13, bracket3: 0.17, bracket4: 0.21 },
  'Associate Manager': { bracket1: 0.11, bracket2: 0.14, bracket3: 0.19, bracket4: 0.23 }
};

/**
 * Calculates Elite level from total accumulated units
 */
export function getEliteLevel(totalUnits) {
  const units = Math.max(0, Number(totalUnits) || 0);
  if (units === 0) {
    return {
      name: 'Starter / Member',
      minUnits: 0,
      maxUnits: 0,
      icon: 'fa-user',
      badgeColor: '#6b7280',
      bgLight: '#f3f4f6',
      unitsNeeded: 1,
      nextLevel: 'Bronze',
      progressPercent: 0
    };
  }

  for (let i = 0; i < ELITE_LEVELS.length; i++) {
    const level = ELITE_LEVELS[i];
    const min = (i === 0) ? 0.01 : level.minUnits;
    if (units >= min && units <= level.maxUnits) {
      const nextLevel = ELITE_LEVELS[i + 1] ? ELITE_LEVELS[i + 1] : null;
      const unitsNeeded = nextLevel ? Number(Math.max(0, nextLevel.minUnits - units).toFixed(2)) : 0;
      
      const range = (level.maxUnits === Infinity) ? 1000 : (level.maxUnits - level.minUnits + 1);
      const currentInTier = units - level.minUnits + 1;
      const progressPercent = nextLevel ? Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100))) : 100;

      return {
        ...level,
        unitsNeeded,
        nextLevel: nextLevel ? nextLevel.name : 'Top Rank Reached',
        progressPercent
      };
    }
  }

  // Fallback for 1501+
  const topTier = ELITE_LEVELS[ELITE_LEVELS.length - 1];
  return {
    ...topTier,
    unitsNeeded: 0,
    nextLevel: 'Top Rank Reached',
    progressPercent: 100
  };
}

/**
 * Calculates accumulated units from net investment fee
 */
export function calculateUnitsFromAmount(netInvestmentFee) {
  const fee = Math.max(0, Number(netInvestmentFee) || 0);
  return Number((fee / UNIT_VALUATION).toFixed(2));
}

/**
 * Returns fee bracket key based on investment fee amount
 */
export function getFeeBracketKey(netInvestmentFee) {
  const fee = Math.max(0, Number(netInvestmentFee) || 0);
  if (fee <= 1999) return 'bracket1';
  if (fee <= 2499) return 'bracket2';
  if (fee <= 2999) return 'bracket3';
  return 'bracket4';
}

/**
 * Returns fee bracket label for display
 */
export function getFeeBracketLabel(netInvestmentFee) {
  const fee = Math.max(0, Number(netInvestmentFee) || 0);
  if (fee <= 1999) return '≤ ₱1,999';
  if (fee <= 2499) return '₱2,000 – ₱2,499';
  if (fee <= 2999) return '₱2,500 – ₱2,999';
  return '≥ ₱3,000';
}

/**
 * Looks up applicable referral percentage and computes total referral fee
 */
export function calculateReferralFee(netInvestmentFee, eliteLevelName) {
  const fee = Math.max(0, Number(netInvestmentFee) || 0);
  let levelKey = eliteLevelName || 'Bronze';
  
  if (!MATRIX_RATES[levelKey]) {
    levelKey = 'Bronze';
  }

  const bracketKey = getFeeBracketKey(fee);
  const percentage = MATRIX_RATES[levelKey][bracketKey];
  const referralFee = Number((fee * percentage).toFixed(2));

  return {
    netInvestmentFee: fee,
    eliteLevel: levelKey,
    feeBracketKey: bracketKey,
    feeBracketLabel: getFeeBracketLabel(fee),
    percentage: percentage,
    percentageFormatted: `${(percentage * 100).toFixed(0)}%`,
    referralFee: referralFee
  };
}

/**
 * Formats currency in PHP (₱)
 */
export function formatPHP(amount) {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

// Function aliases for proposal specification compatibility
export const calculateUnits = calculateUnitsFromAmount;
export const computeReferralFee = calculateReferralFee;
