import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY not found in environment variables'
      }, { status: 400 });
    }

    // Try different API versions to find available models
    const apiVersions = ['v1', 'v1beta'];
    const results: any = {};

    for (const version of apiVersions) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const data = await response.json();
        results[version] = {
          status: response.status,
          ok: response.ok,
          data: data
        };
      } catch (error: any) {
        results[version] = {
          status: 'error',
          ok: false,
          error: error.message
        };
      }
    }

    return NextResponse.json({
      message: 'Available models by API version',
      results,
      apiKeyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...'
    });

  } catch (error: any) {
    console.error('List models error:', error);
    return NextResponse.json({ 
      error: 'Failed to list models', 
      details: error.message 
    }, { status: 500 });
  }
} 