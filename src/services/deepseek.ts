import { getSystemConfigSync } from './systemConfig'

export const DEEPSEEK_API_URL = '/byteplus-api/api/v3/responses';
export const DEEPSEEK_API_KEY = 'VxCgNvLTE.ChthcGlrZXktMjAyNjEwMDUyMjA3NDktbGZyenEQ-5_rmAsYAiDyo-wtKhDgCT1nn4hI6LzlzeTU72K3.vUwluX2I2E5r_-5GdUJJapo_mIprJtyuroN1FWEcgAsaRatBdjaMKEGtxSmDrms9MZr5Zs0LXZ13LOWgJyDZrAeZ';
export const DEEPSEEK_MODEL = 'deepseek-v4-1-flash-261017';

export const getDeepSeekRuntimeConfig = () => {
  const ai = getSystemConfigSync().ai
  return {
    apiUrl: (ai.deepseekApiUrl || DEEPSEEK_API_URL).trim(),
    apiKey: (ai.deepseekApiKey || DEEPSEEK_API_KEY).trim(),
    model: (ai.deepseekModel || DEEPSEEK_MODEL).trim()
  }
}

function extractTextFromResponsesPayload(data: any): string {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data?.choices) && data.choices.length > 0) {
    return String(data.choices[0]?.message?.content || data.choices[0]?.text || '')
  }
  if (typeof data?.output_text === 'string' && data.output_text) {
    return data.output_text
  }
  if (Array.isArray(data?.output)) {
    const texts: string[] = []
    for (const item of data.output) {
      if (item?.type === 'message' && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (typeof c?.text === 'string') texts.push(c.text)
        }
      } else if (typeof item?.text === 'string') {
        texts.push(item.text)
      }
    }
    if (texts.length > 0) return texts.join('\n')
  }
  if (data?.output && typeof data.output?.text === 'string') {
    return data.output.text
  }
  return ''
}

function normalizeAiResponseData(data: any): any {
  if (!data || typeof data !== 'object') return data
  const extracted = extractTextFromResponsesPayload(data)
  if (extracted && (!Array.isArray(data.choices) || data.choices.length === 0)) {
    data.choices = [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: extracted
        },
        text: extracted
      }
    ]
  }
  return data
}

/**
 * Gọi API DeepSeek V4.1 Flash (deepseek-v4-1-flash-261017) qua chuẩn /api/v3/responses để xử lý văn bản, file và dữ liệu
 * @param promptOrMessages Nội dung yêu cầu (text hoặc mảng messages)
 * @param stream Bật chế độ stream trả về từng chữ (mặc định: false)
 * @param useWebSearch Bật công cụ tìm kiếm web (mặc định: false)
 */
export const callDeepSeek = async (promptOrMessages: any, stream: boolean = false, useWebSearch: boolean = false) => {
  const { apiUrl, apiKey, model } = getDeepSeekRuntimeConfig()
  const isResponsesEndpoint = /\/responses\/?$/i.test(apiUrl)

  let combinedText = ''
  let messages: Array<{ role: string; content: string }> = []

  if (Array.isArray(promptOrMessages)) {
    messages = promptOrMessages.map((msg: any) => ({
      role: msg.role || 'user',
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    }))
    combinedText = messages
      .map(m => (m.role === 'system' ? `[HƯỚNG DẪN HỆ THỐNG]\n${m.content}` : m.content))
      .filter(Boolean)
      .join('\n\n')
  } else {
    const singleText = typeof promptOrMessages === 'string' ? promptOrMessages : JSON.stringify(promptOrMessages)
    combinedText = singleText
    messages = [{ role: 'user', content: singleText }]
  }

  const payload: any = isResponsesEndpoint
    ? {
        model,
        stream,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: combinedText
              }
            ]
          }
        ]
      }
    : {
        model,
        stream,
        messages
      }

  // Nếu bật web search
  if (useWebSearch) {
    payload.tools = [
      {
        type: 'web_search',
        max_keyword: 3
      }
    ]
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errBody}`);
    }

    if (stream) {
      // Trả về luồng nguyên bản để xử lý stream
      return response;
    } else {
      // Trả về JSON và đồng bộ cả output lẫn choices[0].message.content
      const data = await response.json();
      return normalizeAiResponseData(data);
    }
  } catch (error) {
    console.error("Lỗi khi gọi DeepSeek API:", error);
    throw error;
  }
};
