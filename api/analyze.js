export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY;
    return res.status(200).json({ 
        keyExists: !!apiKey, 
        keyLength: apiKey?.length || 0
    });
}
