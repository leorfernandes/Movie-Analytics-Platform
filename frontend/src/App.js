// frontend/src/App.js
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import ExecutiveSummary from './components/Dashboard/ExecutiveSummary';
import ChartsContainer from './components/Charts/ChartsContainer';
import MovieExplorer from './components/MovieExplorer/MovieExplorer';
import ErrorBoundary from './components/Common/ErrorBoundary';          // 🔧 ADD THIS
import ToastProvider from './components/Common/ToastProvider';   

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h3: {
      fontWeight: 'bold',
    },
    h4: {
      fontWeight: 'bold',
    },
  },
});

function App() {
  return (
    <ErrorBoundary>                  
      <ToastProvider> 
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>  {/* Responsive padding */}
            <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>  {/* Responsive vertical padding */}
              <ExecutiveSummary />
              <ChartsContainer />
              <MovieExplorer />
            </Box>
          </Container>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;