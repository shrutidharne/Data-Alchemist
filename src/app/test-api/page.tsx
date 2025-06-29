"use client";
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsResult, setModelsResult] = useState<any>(null);

  const testGeminiApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-gemini');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to test API');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailableModels = async () => {
    setModelsLoading(true);
    setModelsResult(null);

    try {
      const response = await fetch('/api/list-models');
      const data = await response.json();

      if (response.ok) {
        setModelsResult(data);
      } else {
        setError(data.error || 'Failed to list models');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setModelsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Gemini API Test
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Test Your Gemini API Key
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          This will test if your GEMINI_API_KEY is working and if the gemini-1.5-pro model is available.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={testGeminiApi}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Test API Key'}
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={checkAvailableModels}
            disabled={modelsLoading}
          >
            {modelsLoading ? <CircularProgress size={20} /> : 'Check Available Models'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Error: {error}
            </Typography>
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              ✅ {result.message}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Model:</strong> {result.modelUsed}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>API Key:</strong> {result.apiKeyPrefix}
            </Typography>
            <Typography variant="body2">
              <strong>Test Response:</strong> {result.testResponse}
            </Typography>
          </Alert>
        )}

        {modelsResult && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📋 Available Models
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>API Key:</strong> {modelsResult.apiKeyPrefix}
            </Typography>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
              <pre>{JSON.stringify(modelsResult.results, null, 2)}</pre>
            </Box>
          </Alert>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          How to Get Your API Key
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          1. Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          2. Sign in with your Google account
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          3. Click "Create API Key" to generate a new key
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          4. Copy the API key and add it to your <code>.env.local</code> file:
        </Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: 14 }}>
          GEMINI_API_KEY=your_api_key_here
        </Box>
      </Paper>
    </Box>
  );
} 