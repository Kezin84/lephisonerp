import { getSystemConfigSync } from './systemConfig'

export const DOLA_API_URL = '/byteplus-api/api/v3/responses';
export const DOLA_API_KEY = 'VxCgNvLTE.ChthcGlrZXktMjAyNjEwMDUyMjA3NDktbGZyenEQ-5_rmAsYAiDyo-wtKhDgCT1nn4hI6LzlzeTU72K3.vUwluX2I2E5r_-5GdUJJapo_mIprJtyuroN1FWEcgAsaRatBdjaMKEGtxSmDrms9MZr5Zs0LXZ13LOWgJyDZrAeZ';
export const DOLA_MODEL = 'seed-2-0-pro-260328';

export const getDolaRuntimeConfig = () => {
  const ai = getSystemConfigSync().ai
  return {
    apiUrl: (ai.dolaApiUrl || DOLA_API_URL).trim(),
    apiKey: (ai.dolaApiKey || DOLA_API_KEY).trim(),
    model: (ai.dolaModel || DOLA_MODEL).trim()
  }
}

/**
 * Gọi API Dola (seed-2-0-pro-260328) để xử lý hình ảnh và văn bản
 * @param prompt Nội dung yêu cầu (text)
 * @param base64Image Chuỗi base64 của ảnh (vd: data:image/jpeg;base64,...), hoặc URL ảnh (tùy thuộc vào model hỗ trợ)
 * @param stream Bật chế độ stream (mặc định: false)
 */
export const callDolaVision = async (prompt: string, base64Image: string, stream: boolean = false) => {
  const { apiUrl, apiKey, model } = getDolaRuntimeConfig()
  const content: any[] = [];
  
  if (prompt) {
    content.push({
      type: "input_text",
      text: prompt
    });
  }
  
  if (base64Image) {
    content.push({
      type: "image_url",
      image_url: {
        url: base64Image
      }
    });
  }

  const payload: any = {
    model: model,
    stream: stream,
    input: [
      {
        role: "user",
        content: content
      }
    ]
  };

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
      throw new Error(`Dola API error: ${response.status} ${response.statusText} - ${errBody}`);
    }

    if (stream) {
      return response;
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Lỗi khi gọi Dola API:", error);
    throw error;
  }
};
