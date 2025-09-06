
// Or detect automatically:
//const API_BASE_URL = __DEV__ 
 // ? 'http://192.168.1.251:8080/api' // Your computer's IP
  //: 'https://your-production-api.com';

const API_BASE_URL = 'http://192.168.1.251:8080'; //instead of local host put ip address
export const getFullLogoUrl = (logoUrl:any) => {
  if (!logoUrl) return null;
  
  if (logoUrl.startsWith('http')) {
    return logoUrl;
  }
  
  const fullUrl = `${API_BASE_URL}${logoUrl}`;
  console.log('🔍 Loading logo from:', fullUrl); // Debug log
  return fullUrl;
};

// Add this debug helper
export const debugLogoLoading = (matchData:any) => {
  console.log('🏠 Home logo URL:', matchData.homeTeam?.logoUrl);
  console.log('🏠 Full home URL:', getFullLogoUrl(matchData.homeTeam?.logoUrl));
  
  console.log('✈️ Away logo URL:', matchData.awayTeam?.logoUrl);
  console.log('✈️ Full away URL:', getFullLogoUrl(matchData.awayTeam?.logoUrl));
}