const axios = require('axios');

const userContext = {
  name: process.env.USER_NAME || "",
  projects: (process.env.USER_PROJECTS || "").split(',').map(p => p.trim()).filter(Boolean),
  goals: (process.env.USER_GOALS || "").split(',').map(g => g.trim()).filter(Boolean),
  values: (process.env.USER_VALUES || "").split(',').map(v => v.trim()).filter(Boolean),
  strengths: (process.env.USER_STRENGTHS || "").split(',').map(s => s.trim()).filter(Boolean),
  weaknesses: (process.env.USER_WEAKNESSES || "").split(',').map(w => w.trim()).filter(Boolean)
};

module.exports = async (req, res) => {
  try {
    // Accept both nested and flat formats
//    const userInput = req.body?.input?.text || req.body?.["input.text"];
    const userInput = req.body.input || "";


    if (!userInput || typeof userInput !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'input.text'" });
    }

    console.log("🎤 Incoming user input:", userInput);

    const prompt = `You are a helpful, context-aware AI assistant named Convo. You are speaking with ${userContext.name}, 
who is working on ${userContext.projects.join(", ")}, focused on ${userContext.goals.join(", ")},
with core values ${userContext.values.join(", ")}, strengths ${userContext.strengths.join(", ")}, and weaknesses ${userContext.weaknesses.join(", ")}.

${userContext.name} says: "${userInput}"

Respond like a thoughtful collaborator.`;

    // 🧠 Call OpenAI
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a conversational collaborator with memory. Keep replies concise and under 20 seconds when read aloud." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

//    const replyText = gptResponse.data.choices[0].message.content;

    let replyText = gptResponse.data.choices[0].message.content.trim();

    // Limit to ~500 characters (approx. 15–20s of speech)
    if (replyText.length > 500) {
      replyText = replyText.substring(0, 497) + '...';
    }

    console.log("🧾 GPT reply:", replyText);

    // 🔊 Text-to-Speech
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text: replyText,
        voice_settings: { stability: 0.4, similarity_boost: 0.8 }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    console.log("🗣️ Audio length (bytes):", ttsResponse.data.length);

    const audioBase64 = Buffer.from(ttsResponse.data, 'binary').toString('base64');

//    res.status(200).json({ audio: audioBase64 });

    const silentWavBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."; // trimmed for space
    res.status(200).json({ audio: silentWavBase64 });



    // res.status(200).json({
    //   audio: null,
    //   text: "THIS SHOULD NEVER BE USED"
    // });

    
  } catch (err) {
    console.error("Error during webhook processing:", err.response?.data || err.message || err);
    res.status(500).send("Error generating response");
  }
};
