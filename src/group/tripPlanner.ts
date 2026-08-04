import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TripStop {
  stopOrder: number;
  stopName: string;
  recommendedDish: string;
  recommendedPlace: string;
  estimatedTime: string;
}

export interface TripPlan {
  tripTitle: string;
  stops: TripStop[];
  googleMapsUrl: string;
  totalEstimatedTime: string;
}

export class TripPlannerService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    // If no key provided, this will throw an error or we fallback
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');
  }

  async planTrip(tripTitle: string, stops: string[]): Promise<TripPlan> {
    const isMock = !process.env.GEMINI_API_KEY;
    let tripStops: TripStop[];

    if (isMock) {
      // Fallback behavior if no API Key is provided
      const defaultDishes = [
        { place: 'Quán Ăn Sáng Địa Phương', dish: 'Phở bò gia truyền', time: '08:00 AM' },
        { place: 'Tiệm Cà Phê Phố Cổ', dish: 'Cà phê trứng đặc sản', time: '10:30 AM' },
        { place: 'Nhà Hàng Ẩm Thực Bờ Hồ', dish: 'Bún chả nướng than hoa', time: '01:00 PM' },
        { place: 'Quán Ăn Vặt Nổi Tiếng', dish: 'Bánh tráng nướng & Chè hạt sen', time: '04:30 PM' },
        { place: 'Nhà Hàng Hải Sản Đêm', dish: 'Lẩu hải sản tươi sống', time: '07:30 PM' }
      ];
      tripStops = stops.map((stopName, idx) => {
        const recommendation = defaultDishes[idx % defaultDishes.length];
        return {
          stopOrder: idx + 1,
          stopName,
          recommendedPlace: `${recommendation.place} (${stopName})`,
          recommendedDish: recommendation.dish,
          estimatedTime: recommendation.time
        };
      });
    } else {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a food tour planner. I am taking a trip passing through these stops: ${stops.join(', ')}.
Please recommend ONE famous local dish and ONE hypothetical restaurant name for EACH stop. Provide an estimated time of arrival for each (e.g. 08:00 AM, 11:30 AM). 
Return exactly in this JSON format:
{
  "stops": [
    { "stopOrder": 1, "stopName": "string", "recommendedDish": "string", "recommendedPlace": "string", "estimatedTime": "string" }
  ]
}
Do not return any markdown wrappers like \`\`\`json, just the raw JSON object.`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean markdown JSON formatting if the model still includes it
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsed = JSON.parse(text);
        tripStops = parsed.stops;
      } catch (e) {
        console.error('LLM Trip Planner failed, using fallback.', e);
        // Fallback
        tripStops = stops.map((stopName, idx) => ({
          stopOrder: idx + 1,
          stopName,
          recommendedPlace: `Nhà Hàng tại ${stopName}`,
          recommendedDish: 'Món Đặc Sản Địa Phương',
          estimatedTime: 'TBD'
        }));
      }
    }

    // Build Google Maps direction URL
    let googleMapsUrl = 'https://www.google.com/maps/dir/?api=1';
    if (stops.length > 0) {
      const origin = encodeURIComponent(stops[0]);
      const destination = encodeURIComponent(stops[stops.length - 1]);
      googleMapsUrl += `&origin=${origin}&destination=${destination}`;

      if (stops.length > 2) {
        const waypoints = stops.slice(1, -1).map(s => encodeURIComponent(s)).join('|');
        googleMapsUrl += `&waypoints=${waypoints}`;
      }
    }

    return {
      tripTitle: tripTitle || 'Chuyến Đi Ẩm Thực',
      stops: tripStops,
      googleMapsUrl,
      totalEstimatedTime: `${stops.length * 2.5} giờ`
    };
  }
}

export const tripPlannerService = new TripPlannerService();
