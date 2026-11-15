
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'openai/gpt-oss-120b';

const SYSTEM_PROMPT = `You are SehatSaarthi, a compassionate AI healthcare assistant for users in India.

STRICT RULES:
1. Always recommend consulting a qualified doctor for diagnosis and treatment.
2. For emergencies: always say "Call 108 (Ambulance) right away!" immediately.
3. Never diagnose specific medical conditions.
4. Never prescribe specific medications or dosages.
5. Use simple, clear language — explain medical terms in everyday words.
6. Be warm, patient, and culturally sensitive to Indian users.
7. Treat medical reports as information to explain, not as a basis for diagnosis.

YOU CAN HELP WITH: general health education, what symptoms might indicate,
first aid guidance, general medicine information, mental health support,
nutrition advice, fitness guidance, and explaining medical reports simply.

Always end with: If symptoms are severe or persistent, please see a qualified doctor immediately.`;

const streamChat = async (message, history = [], onChunk) => {
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...history.slice(-10).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages,
    max_completion_tokens: 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;

    if (content) {
      onChunk(content);
    }
  }
};

const generateTitle = async (firstMessage) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Create a short 4-6 word title for this health question. Return the title only: "${firstMessage}"`,
      },
    ],
    max_completion_tokens: 100,
  });

  return (
    completion.choices[0]?.message?.content?.trim().slice(0, 60) ||
    'New Health Conversation'
  );
};

module.exports = { streamChat, generateTitle };
