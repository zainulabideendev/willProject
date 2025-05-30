import { Profile } from './types';

// Utility function to debounce calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Calculate estate score based on profile completion
export function calculateEstateScore(profile: Profile): number {
  let score = 0;
  
  // Step 1: Profile Setup (20%)
  if (profile.profile_setup_complete) {
    score += 20;
  }

  // Step 2: Assets (20%)
  if (profile.assets_added) {
    score += 20;
  }

  // Step 3: Beneficiaries (20%)
  if (profile.beneficiaries_chosen) {
    score += 20;
  }

  // Step 4: Last Wishes (15%)
  if (profile.last_wishes_documented) {
    score += 15;
  }

  // Step 5: Executor (15%)
  if (profile.executor_chosen) {
    score += 15;
  }

  // Step 6: Will Review (5%)
  if (profile.will_reviewed) {
    score += 5;
  }
  
  // Step 7: Download & Sign (5%)
  if (profile.will_downloaded) {
    score += 5;
  }

  return score;
}