export const getDefaultAvatar = (gender?: string): string => {
  if (!gender) return '/assets/default_male.svg'; // fallback
  
  const g = gender.toLowerCase();
  if (g === 'p' || g === 'perempuan' || g === 'cewe' || g === 'female' || g === 'f') {
    return '/assets/default_female.svg';
  }
  
  return '/assets/default_male.svg';
};
