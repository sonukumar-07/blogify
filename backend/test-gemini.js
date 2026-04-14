// Test script to verify Gemini API configuration
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🔍 Testing Gemini API Configuration...\n');
  
  // 1. Check API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.log('💡 Add it to your .env file: GEMINI_API_KEY=your-key-here');
    process.exit(1);
  }
  
  console.log('✅ API Key found');
  console.log(`   Key starts with: ${apiKey.substring(0, 10)}...`);
  console.log('');
  
  // 2. Initialize Client
  console.log('📡 Initializing Google Generative AI client...');
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log('✅ Client initialized');
  console.log('');
  
  // 3. Test Model Access
  console.log('🤖 Testing model: gemini-pro');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Model instance created');
    console.log('');
    
    // 4. Test Generation
    console.log('✨ Generating test content...');
    const prompt = 'Write exactly one sentence about artificial intelligence.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Generation successful!');
    console.log('📝 Generated text:');
    console.log(`   "${text}"`);
    console.log('');
    
    // 5. Test with Blog Prompt
    console.log('📚 Testing with blog-style prompt...');
    const blogPrompt = `Write a very short blog post (2 sentences) about coffee in JSON format:
{
  "title": "title here",
  "content": "content here",
  "summary": "summary here"
}`;
    
    const blogResult = await model.generateContent(blogPrompt);
    const blogResponse = await blogResult.response;
    const blogText = blogResponse.text();
    
    console.log('✅ Blog generation successful!');
    console.log('📝 Generated response:');
    console.log(blogText.substring(0, 200) + '...');
    console.log('');
    
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Gemini API is working correctly');
    console.log('✅ You can use AI generation in your blog platform');
    
  } catch (error) {
    console.error('❌ Error during generation:');
    console.error('');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.status) console.error('Error status:', error.status);
    if (error.statusText) console.error('Error status text:', error.statusText);
    if (error.details) console.error('Error details:', error.details);
    console.error('');
    console.error('Full error:', error);
    console.error('');
    
    // Provide helpful suggestions
    console.log('💡 Troubleshooting:');
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid')) {
      console.log('   → Your API key appears to be invalid');
      console.log('   → Get a new key at: https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('   → Enable the Generative Language API');
      console.log('   → Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    } else if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota')) {
      console.log('   → You have exceeded your API quota');
      console.log('   → Check your quota at: https://console.cloud.google.com/');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('   → Model "gemini-pro" might not be available');
      console.log('   → Check available models at: https://ai.google.dev/models/gemini');
    } else {
      console.log('   → Check your internet connection');
      console.log('   → Verify API key at: https://makersuite.google.com/app/apikey');
    }
    
    process.exit(1);
  }
}

testGemini();

