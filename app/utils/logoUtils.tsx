const API_BASE_URL = 'http://localhost:8080'; // Move this to config

export const getFullLogoUrl = (logoUrl:any) => {
  if (!logoUrl) return null;
  
  // If it's already a full URL, return as is
  if (logoUrl.startsWith('http')) {
    return logoUrl;
  }
  
  // If it's a relative path, prepend base URL
  return `${API_BASE_URL}${logoUrl}`;
};