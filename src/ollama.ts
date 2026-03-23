const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const TIMEOUT_MS = 30_000;
export const DEFAULT_MODEL = 'qwen2.5-coder:1.5b';

function tryParseJson(raw: string): CommandResult | null {
  // Strip code fences
  let str = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  // Try to extract JSON object if there's surrounding text
  const jsonMatch = str.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  str = jsonMatch[0];

  // Fix common LLM JSON issues: trailing commas, missing quotes
  str = str.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

  try {
    const parsed = JSON.parse(str);
    if (parsed.command && typeof parsed.command === 'string') {
      return {
        command: parsed.command.trim(),
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      };
    }
  } catch {
    // JSON still malformed — give up
  }

  return null;
}

export interface CommandResult {
  command: string;
  flags: { flag: string; desc: string }[];
}

export async function generateCommand(
  systemPrompt: string,
  userQuery: string,
  model?: string
): Promise<CommandResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1,
          num_predict: 500,
        },
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(
        'Ollama is not responding (30s timeout). The model may still be loading — try again.'
      );
    }
    if (err.code === 'ECONNREFUSED' || err.cause?.code === 'ECONNREFUSED') {
      throw new Error(
        'Cannot connect to Ollama at localhost:11434. Start it with: ollama serve'
      );
    }
    throw new Error(`Failed to connect to Ollama: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (response.status === 404 || body.includes('not found')) {
      const usedModel = model || 'qwen2.5-coder:1.5b';
      throw new Error(
        `Model '${usedModel}' not found. Pull it with: ollama pull ${usedModel}`
      );
    }
    throw new Error(`Ollama error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const raw: string = data?.message?.content?.trim() || '';

  if (!raw) {
    throw new Error('Ollama returned an empty response. Try rephrasing your request.');
  }

  // Try to parse as JSON (expected format)
  const jsonResult = tryParseJson(raw);
  if (jsonResult) {
    return jsonResult;
  }

  // Fallback: treat the whole response as a plain command
  let command = raw;
  command = command.replace(/^```(?:bash|sh|zsh|shell|json)?\n?/, '').replace(/\n?```$/, '');
  command = command.replace(/^`|`$/g, '');
  command = command.trim();

  return { command, flags: [] };
}
