export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
    const { image } = req.body;
    // This pulls the key from Vercel's secure environment variables
    const apiKey = process.env.GEMINI_API_KEY; 
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: 'image/jpeg', data: image } },
                { text: 'Analyze this plant image and provide a diagnosis. Return ONLY a JSON object with keys "issue" and "description".' }
              ]
            }]
          })
        }
      );
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze image" });
    }
  }