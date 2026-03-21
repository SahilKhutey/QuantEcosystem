/**
 * Global Equity Data Service - Live YFinance Integration
 */

export const getEquityData = async () => {
  try {
    // Assuming backend is running on standard local port 5000
    const response = await fetch('http://localhost:5000/api/market/indices', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.status === 'success') {
        return result.data;
    }
    
    throw new Error(result.message || 'Failed to fetch equity data');
  } catch (error) {
    console.error("Error fetching live global indices:", error);
    return null;
  }
};
