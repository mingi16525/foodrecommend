import { Router } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { validate } from '../middleware/validate';
import { tripPlanSchema } from '../validators/trip.validator';

export const tripRouter = Router();

// Khởi tạo Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          time: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          location: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING }
        },
        required: ["time", "title", "location", "type"]
      }
    }
  }
});

import { requirePremium } from '../middleware/premium';

tripRouter.post('/plan', requirePremium, validate(tripPlanSchema), async (req, res) => {
  const { groupName, preferences } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    let context = `Lập lịch trình cho nhóm "${groupName || 'Chưa đặt tên'}". `;
    if (preferences) {
      context += `Yêu cầu thêm: ${preferences}. `;
    }

    const prompt = `${context} Hãy tạo một lịch trình chi tiết trong một ngày gồm các hoạt động ăn uống và tham quan.
Mỗi mục cần có thời gian (time), tiêu đề hoạt động (title), địa điểm (location), và loại (type: 'food' hoặc 'activity' hoặc 'meetup').
Đối với các hoạt động ăn uống (type: 'food'), hãy ưu tiên gợi ý theo dạng Set, Combo hoặc Mâm thức ăn phù hợp với ngữ cảnh nhóm (VD: "Combo bún đậu", "Set nướng BBQ").
Trả về định dạng mảng JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const itinerary = JSON.parse(text);

    res.json({ data: itinerary });
  } catch (e: unknown) {
    console.error('Error in trip planner API:', e);
    const error = e as Error;
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});
