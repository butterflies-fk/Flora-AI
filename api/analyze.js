cat > api/analyze.js << 'EOF'
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    try {
        let body = req.body;
        if (!body) return res.status(400).json({ error: 'No body received' });
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) { return res.status(400).json({ error: 'Invalid JSON' }); }
        }
        let image = body.image;
        if (!image) return res.status(400).json({ error: 'No image received' });
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set" });
        if (image.includes(',')) image = image.split(',')[1];
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { inline_data: { mime_type: 'image/jpeg', data: image } },
                            { text: 'Analyze this plant. Return ONLY valid JSON with keys "issue" and "description".' }
                        ]
                    }]
                })
            }
        );
        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("Empty AI response");
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}') + 1;
        const result = JSON.parse(rawText.substring(jsonStart, jsonEnd));
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
EOF