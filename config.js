import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/** Ensure the OpenAI API key is available and correctly configured */
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing or invalid.");
}

/** OpenAI config - SERVER-SIDE ONLY (API key is never exposed to browser) */
export default new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});