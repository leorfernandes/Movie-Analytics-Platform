// frontend/src/components/Common/LoadingStates.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  Skeleton, 
  Box, 
  CircularProgress, 
  Typography 
} from '@mui/material';

export const KPICardSkeleton = () => (
  <Card sx={{ height: '140px' }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="80%" height={32} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const ChartLoadingCard = ({ title, height = 400 }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        {title}
      </Typography>
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="textSecondary">
          Loading insights...
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const TableLoadingSkeleton = ({ rows = 5 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1, p: 1 }}>
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="rectangular" width="10%" height={24} />
        <Skeleton variant="text" width="15%" />
      </Box>
    ))}
  </Box>
);