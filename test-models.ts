// test-models.ts - Simple script to test available Gemini models
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY: string | undefined = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('\u274c GEMINI_API_KEY not found in .env.local file');
  process.exit(1);
}

console.log('\ud83d\udd11 API Key found:', API_KEY.substring(0, 10) + '...');
console.log('\ud83d\udd0d Testing available models...\n');

const models: string[] = [
  'gemini-pro',
  'gemini-1.5-pro', 
  'gemini-1.0-pro',
  'gemini-1.5-flash',
  'gemini-1.0-pro-001'
];

type TestResult = {
  model: string;
  status: string;
  error?: any;
};

async function testModel(modelName: string): Promise<TestResult> {
  try {
    console.log(`Testing ${modelName}...`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say 'Hello' in one word." }] }]
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log(`\u2705 ${modelName} - WORKING`);
      return { model: modelName, status: 'working' };
    } else if (data.error?.code === 429) {
      console.log(`\u26a0\ufe0f  ${modelName} - RATE LIMITED`);
      return { model: modelName, status: 'rate_limited' };
    } else if (data.error?.code === 404) {
      console.log(`\u274c ${modelName} - NOT FOUND`);
      return { model: modelName, status: 'not_found' };
    } else {
      console.log(`\u274c ${modelName} - ERROR: ${data.error?.message || 'Unknown error'}`);
      return { model: modelName, status: 'error', error: data.error };
    }
  } catch (error: any) {
    console.log(`\u274c ${modelName} - NETWORK ERROR: ${error.message}`);
    return { model: modelName, status: 'network_error', error: error.message };
  }
}

async function main(): Promise<void> {
  const results: TestResult[] = [];
  
  for (const model of models) {
    const result = await testModel(model);
    results.push(result);
    console.log(''); // Empty line for readability
  }

  console.log('\ud83d\udcca SUMMARY:');
  console.log('==========');
  
  const working = results.filter(r => r.status === 'working');
  const rateLimited = results.filter(r => r.status === 'rate_limited');
  const notFound = results.filter(r => r.status === 'not_found');
  const errors = results.filter(r => r.status === 'error' || r.status === 'network_error');

  if (working.length > 0) {
    console.log(`\u2705 Working models: ${working.map(r => r.model).join(', ')}`);
  }
  
  if (rateLimited.length > 0) {
    console.log(`\u26a0\ufe0f  Rate limited models: ${rateLimited.map(r => r.model).join(', ')}`);
  }
  
  if (notFound.length > 0) {
    console.log(`\u274c Not found models: ${notFound.map(r => r.model).join(', ')}`);
  }
  
  if (errors.length > 0) {
    console.log(`\u274c Error models: ${errors.map(r => r.model).join(', ')}`);
  }

  if (working.length === 0) {
    console.log('\n\ud83d\udca1 SUGGESTIONS:');
    console.log('1. Check if your API key is valid');
    console.log('2. Wait for rate limits to reset');
    console.log('3. Try upgrading your API plan');
    console.log('4. Check Google AI Studio for available models');
  }
}

main().catch(console.error); 