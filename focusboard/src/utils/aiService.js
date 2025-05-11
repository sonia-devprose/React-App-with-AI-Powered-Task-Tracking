// aiService.js

const HF_API_TOKEN = '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';
const HF_MODEL_ID = 'HuggingFaceH4/zephyr-7b-beta';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`;

// Robust API caller with retries and timeout
async function callHuggingFace(prompt, maxRetries = 3, timeout = 10000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.2,
            do_sample: false,
            return_full_text: false
          },
          options: { wait_for_model: true }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 503 && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }
      throw new Error('Unexpected API response format');
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      console.warn(`Attempt ${attempt} failed, retrying...`, error);
    }
  }
  throw new Error('All retries failed');
}

// Robust JSON extractor with multiple fallbacks
function extractJson(raw) {
  if (!raw) throw new Error('Empty response');

  // Clean the response
  let cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.log('Direct parse failed, trying extraction');
  }

  // Multiple extraction strategies
  const strategies = [
    () => {
      const match = cleaned.match(/{[\s\S]*?}/);
      return match ? JSON.parse(match[0]) : null;
    },
    () => {
      const fixed = cleaned
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/:([a-zA-Z0-9_]+)/g, ':"$1"');
      try {
        return JSON.parse(fixed);
      } catch (e) {
        return null;
      }
    },
    () => {
      const lines = cleaned.split('\n').filter(line => line.trim());
      const jsonLike = lines.find(line => line.includes('{') && line.includes('}'));
      if (jsonLike) {
        try {
          return JSON.parse(jsonLike);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
  ];

  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result) return result;
    } catch (e) {
      continue;
    }
  }
  throw new Error('All JSON extraction strategies failed');
}

// Categorize and prioritize a task
export async function categorizeAndPrioritize(task) {
  if (!task?.trim()) {
    return {
      category: 'Other',
      priority: 'Medium'
    };
  }

  const prompt = `
STRICT INSTRUCTIONS:
1. Respond with ONLY valid JSON
2. Format: {"category":"...","priority":"High/Medium/Low"}
3. Never add explanations

EXAMPLES:
Input: "Buy milk"
Output: {"category":"Shopping","priority":"Medium"}

Input: "Finish report"
Output: {"category":"Work","priority":"High"}

NOW PROCESS:
"${task.trim()}"
Output:`.trim();

  try {
    let raw = await callHuggingFace(prompt);
    
    if (raw.includes('STRICT INSTRUCTIONS')) {
      raw = raw.split('Output:')[1]?.trim() || raw;
    }

    const parsed = extractJson(raw);
    
    // Validate response
    if (!parsed.category || !parsed.priority) {
      throw new Error('Missing required fields');
    }

    return {
      category: String(parsed.category).trim() || 'Other',
      priority: ['High','Medium','Low'].includes(parsed.priority) 
        ? parsed.priority 
        : 'Medium'
    };
  } catch (error) {
    console.error('Categorization failed:', error);
    return {
      category: 'Other',
      priority: 'Medium'
    };
  }
}

// Get smart suggestions for tasks
export async function getSmartSuggestions(inputText) {
  if (!inputText?.trim()) {
    return {
      description: [],
      time: []
    };
  }

  const prompt = `
STRICT INSTRUCTIONS:
1. Respond with ONLY valid JSON
2. Format: {"description":["...","...","..."],"time":["...","...","..."]}
3. Never use placeholders

EXAMPLES:
Input: "meeting"
Output: {"description":["Schedule meeting","Prepare agenda","Send invites"],"time":["Today 2pm","Tomorrow AM","Friday"]}

Input: "email"
Output: {"description":["Write newsletter","Reply to clients","Organize inbox"],"time":["Morning","After lunch","EOD"]}

NOW PROCESS:
"${inputText.trim()}"
Output:`.trim();

  try {
    let raw = await callHuggingFace(prompt);
    
    if (raw.includes('STRICT INSTRUCTIONS')) {
      raw = raw.split('Output:')[1]?.trim() || raw;
    }

    const parsed = extractJson(raw);
    
    // Validate response
    if (!Array.isArray(parsed?.description) || !Array.isArray(parsed?.time)) {
      throw new Error('Invalid response structure');
    }

    // Clean and format suggestions
    const clean = (arr) => arr
      .slice(0, 3)
      .map(item => String(item).trim())
      .filter(item => item && !item.toLowerCase().includes('example'));

    return {
      description: clean(parsed.description),
      time: clean(parsed.time)
    };
  } catch (error) {
    console.error('Suggestion failed:', error);
    return {
      description: [
        `Complete ${inputText}`,
        `Review ${inputText}`,
        `Follow up on ${inputText}`
      ],
      time: ['Today', 'Tomorrow', 'This week']
    };
  }
}

// Export as both named and default exports
const aiService = {
  categorizeAndPrioritize,
  getSmartSuggestions,
  callHuggingFace, // optional - only expose if needed
  extractJson      // optional - only expose if needed
};

export default aiService;
//export {  getSmartSuggestions };