import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Create market data slice
const marketDataSlice = createSlice({
  name: 'marketData',
  initialState: {
    connections: {},
    data: {},
    loading: false,
    error: null,
    historicalData: {}
  },
  reducers: {
    connectSymbol: (state, action) => {
      const symbol = action.payload;
      if (!state.connections[symbol]) {
        state.connections[symbol] = 0;
      }
      state.connections[symbol] += 1;
    },
    disconnectSymbol: (state, action) => {
      const symbol = action.payload;
      if (state.connections[symbol] > 0) {
        state.connections[symbol] -= 1;
      }
      if (state.connections[symbol] === 0) {
        delete state.connections[symbol];
      }
    },
    updateData: (state, action) => {
      const { symbol, data } = action.payload;
      if (!state.data[symbol]) {
        state.data[symbol] = [];
      }
      state.data[symbol].push(data);
      
      // Keep only the last 100 data points
      if (state.data[symbol].length > 100) {
        state.data[symbol] = state.data[symbol].slice(-100);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoricalData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.loading = false;
        const { symbol, data } = action.payload;
        state.historicalData[symbol] = data;
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Async thunk for getting historical data
export const fetchHistoricalData = createAsyncThunk(
  'marketData/fetchHistoricalData',
  async ({ symbol, timeframe, start, end }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/historical-data?symbol=${symbol}&timeframe=${timeframe}${start ? `&start=${start}` : ''}${end ? `&end=${end}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch historical data');
      }
      
      const data = await response.json();
      return {
        symbol,
        data,
        timeframe
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const { connectSymbol, disconnectSymbol, updateData } = marketDataSlice.actions;
export default marketDataSlice.reducer;

// Websocket connection service
export const startMarketStream = (symbol) => {
  return async (dispatch, getState) => {
    // Check if already connected
    if (getState().marketData.connections[symbol] > 0) {
      dispatch(connectSymbol(symbol));
      return;
    }
    
    try {
      // Establish WebSocket connection
      const socket = new WebSocket(`wss://market-data.example.com/stream?symbol=${symbol}`);
      
      socket.onopen = () => {
        console.log(`Connected to market data stream for ${symbol}`);
        dispatch(connectSymbol(symbol));
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        dispatch(updateData({ symbol, data }));
      };
      
      socket.onclose = () => {
        console.log(`Disconnected from market data stream for ${symbol}`);
        dispatch(disconnectSymbol(symbol));
      };
      
      // Store socket reference
      if (!window.marketSockets) {
        window.marketSockets = {};
      }
      window.marketSockets[symbol] = socket;
      
    } catch (error) {
      console.error('Failed to connect to market data stream:', error);
      dispatch(disconnectSymbol(symbol));
    }
  };
};

// Clean up WebSocket connections
export const stopMarketStream = (symbol) => {
  return (dispatch) => {
    if (window.marketSockets && window.marketSockets[symbol]) {
      window.marketSockets[symbol].close();
      delete window.marketSockets[symbol];
    }
    dispatch(disconnectSymbol(symbol));
  };
};
