export const DEEPSEEK_API_URL = '/byteplus-api/api/v3/responses';
export const DEEPSEEK_API_KEY = 'VxCgNvLTE.ChthcGlrZXktMjAyNjEwMDUyMTA2MjEtN2ZzOW0Q-5_rmAsYAiCfgOwtKhAaV-B60txBRYBHBOtS7fGX.3anjjKeiObCad8KG5EhozRtIuoD2U-BFpSMbkg0T_HZW4vy4gHGiyyx5DjmiJrkVDu0bG_oO8PuNQmGsOS12HweZ';
export const DEEPSEEK_MODEL = 'deepseek-v4-pro-ga-260813';

/**
 * Gọi API DeepSeek V4 Pro để xử lý các yêu cầu
 * @param prompt Nội dung yêu cầu (text)
 * @param stream Bật chế độ stream trả về từng chữ (mặc định: false)
 * @param useWebSearch Bật công cụ tìm kiếm web (mặc định: false)
 */
export const callDeepSeek = async (prompt: string, stream: boolean = false, useWebSearch: boolean = false) => {
  const payload: any = {
    model: DEEPSEEK_MODEL,
    stream: stream,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: prompt
          }
        ]
      }
    ]
  };

  // Nếu bật web search
  if (useWebSearch) {
    payload.tools = [
      {
        type: "web_search",
        max_keyword: 3
      }
    ];
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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
      // Trả về JSON nếu không dùng stream
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Lỗi khi gọi DeepSeek API:", error);
    throw error;
  }
};
