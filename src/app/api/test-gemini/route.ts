import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY not found in environment variables',
        available: false 
      }, { status: 400 });
    }

    // Test a simple generation to verify the API key works
    const testPrompt = "Say 'Hello, API key is working!' in one sentence.";
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: testPrompt }] }]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API test error:', data);
      
      // Check if it's an authentication error
      if (data.error?.code === 403 || data.error?.message?.includes('API_KEY_INVALID')) {
        return NextResponse.json({ 
          error: 'Invalid API key. Please check your GEMINI_API_KEY.',
          available: false,
          details: data.error?.message 
        }, { status: 401 });
      }
      
      // Check if it's a model not found error
      if (data.error?.code === 404 || data.error?.message?.includes('NOT_FOUND')) {
        return NextResponse.json({ 
          error: 'Model not found or not available with your API key.',
          available: false,
          details: data.error?.message 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        error: 'Gemini API error', 
        available: false,
        details: data.error?.message || data 
      }, { status: response.status });
    }

    // Gemini's response format
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!aiText) {
      return NextResponse.json({ 
        error: 'Gemini API returned empty response',
        available: false,
        details: data 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'API key is working!',
      testResponse: aiText,
      modelUsed: 'gemini-1.5-pro',
      apiKeyPrefix: process.env.GEMINI_API_KEY.substring(0, 10) + '...' // Show first 10 chars for verification
    });

  } catch (error: any) {
    console.error('Gemini API test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test Gemini API', 
      available: false,
      details: error.message 
    }, { status: 500 });
  }
} 