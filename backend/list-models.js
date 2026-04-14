// List available Gemini models for this API key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Try to list models using the API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Available models:');
    console.log('');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`📦 ${model.name}`);
        if (model.displayName) console.log(`   Display name: ${model.displayName}`);
        if (model.description) console.log(`   Description: ${model.description}`);
        if (model.supportedGenerationMethods) {
          console.log(`   Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
        console.log('');
      });
      
      // Check for text generation models
      const textModels = data.models.filter(m => 
        m.supportedGenerationMethods && 
        m.supportedGenerationMethods.includes('generateContent')
      );
      
      console.log('📝 Models that support text generation (generateContent):');
      textModels.forEach(m => console.log(`   - ${m.name}`));
      
    } else {
      console.log('⚠️  No models found for this API key');
      console.log('');
      console.log('💡 This might mean:');
      console.log('   1. The Generative Language API is not enabled');
      console.log('   2. The API key is invalid');
      console.log('   3. You need to enable the API at:');
      console.log('      https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    }
    
  } catch (error) {
    console.error('❌ Error listing models:');
    console.error(error.message);
    console.log('');
    console.log('💡 Try this:');
    console.log('   1. Check your API key at: https://makersuite.google.com/app/apikey');
    console.log('   2. Enable Generative Language API at:');
    console.log('      https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    console.log('   3. Create a new API key if needed');
  }
}

listModels();

