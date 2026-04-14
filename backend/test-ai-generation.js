// Test AI generation functionality
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
  console.log('🧪 Testing AI Generation System...\n');
  
  // 1. Check API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  // 2. Test Model Access
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    console.log('✅ Model initialized: gemini-2.5-flash');
    
    // 3. Test Basic Generation
    console.log('\n📝 Testing basic generation...');
    const testResult = await model.generateContent('Write one sentence about coffee.');
    const testText = testResult.response.text();
    console.log('✅ Basic generation works:', testText.substring(0, 80) + '...');
    
    // 4. Test Blog Generation with JSON
    console.log('\n📝 Testing blog generation with JSON output...');
    const systemPrompt = `You are an expert blog writer. Create high-quality, SEO-friendly blog content.

IMPORTANT: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no extra text.

Required JSON structure:
{
  "title": "An engaging, SEO-friendly title",
  "content": "<p>HTML formatted content with proper tags</p>",
  "summary": "A brief 1-2 sentence summary",
  "metaDescription": "SEO meta description under 155 characters",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "CategoryName"
}

Guidelines:
- Title: Clear, engaging, 50-60 characters
- Content: Use HTML tags (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>) for rich formatting
- Summary: Concise, compelling, 1-2 sentences
- Tags: 5-8 relevant keywords (lowercase, no spaces)
- Category: Single relevant category (Technology, Health, Business, Education, etc.)`;
    
    const fullPrompt = `${systemPrompt}\n\nUser Request: Write a short blog post about the benefits of morning exercise\n\nRespond with ONLY the JSON object, nothing else:`;
    
    const blogResult = await model.generateContent(fullPrompt);
    const blogText = blogResult.response.text();
    
    console.log('\n📄 Raw Response (first 300 chars):');
    console.log(blogText.substring(0, 300) + '...\n');
    
    // 5. Test JSON Parsing
    console.log('🔍 Testing JSON parsing...');
    let parsed;
    try {
      // Remove markdown code blocks if present
      let cleanText = blogText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // Remove any leading/trailing text before/after JSON
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      parsed = JSON.parse(cleanText);
      console.log('✅ JSON parsing successful!');
      console.log('\n📊 Parsed Structure:');
      console.log('  Title:', parsed.title);
      console.log('  Content length:', parsed.content?.length || 0, 'chars');
      console.log('  Summary:', parsed.summary?.substring(0, 80) + '...');
      console.log('  Category:', parsed.category);
      console.log('  Tags:', parsed.tags);
      
      // Validate structure
      const issues = [];
      if (!parsed.title) issues.push('Missing title');
      if (!parsed.content) issues.push('Missing content');
      if (!parsed.summary) issues.push('Missing summary');
      if (!parsed.category) issues.push('Missing category');
      if (!parsed.tags || !Array.isArray(parsed.tags)) issues.push('Invalid tags');
      
      if (issues.length > 0) {
        console.log('\n⚠️  Issues found:');
        issues.forEach(issue => console.log('  -', issue));
      } else {
        console.log('\n✅ All required fields present and valid!');
      }
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('\n💡 This means the AI is not returning pure JSON.');
      console.log('   The response may need better prompt engineering.');
    }
    
    console.log('\n🎉 AI Generation Test Complete!');
    console.log('\n✅ Summary:');
    console.log('  • API Key: Valid');
    console.log('  • Model: gemini-2.5-flash (working)');
    console.log('  • Basic Generation: Working');
    console.log('  • Blog Generation: ' + (parsed ? 'Working' : 'Needs Improvement'));
    console.log('  • JSON Parsing: ' + (parsed ? 'Working' : 'Failing'));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:');
    console.error(error);
    process.exit(1);
  }
}

testAI();

