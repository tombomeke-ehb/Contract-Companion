import axios from "axios";

/**
 * Stuur een prompt naar Ollama en krijg het modelantwoord terug.
 * @param {object} opts
 * @param {string} opts.prompt - De prompt die je naar het model stuurt.
 * @param {string} [opts.model="qwen2"] - Modelnaam in Ollama.
 * @returns {Promise<string>} - Het antwoord van het model als string.
 */
export async function runLlm2LegalOllama({ prompt, model = "qwen2" }) {
  const response = await axios.post("http://127.0.0.1:11434/api/generate", {
    model,
    prompt,
    stream: false,
  });
  return response.data.response;
}
