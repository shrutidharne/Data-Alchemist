// Simple test to check Gemini API
const API_KEY: string | undefined = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND');

if (!API_KEY) {
  console.error('No API key found. Make sure GEMINI_API_KEY is set in your environment.');
  process.exit(1);
}

async function testGemini(): Promise<void> {
  try {
    console.log('Testing gemini-pro model...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say 'Hello' in one word." }] }]
        }),
      }
    );

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testGemini(); 