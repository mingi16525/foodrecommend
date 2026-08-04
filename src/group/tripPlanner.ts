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
  planTrip(tripTitle: string, stops: string[]): TripPlan {
    const defaultDishes = [
      { place: 'Quán Ăn Sáng Địa Phương', dish: 'Phở bò gia truyền', time: '08:00 AM' },
      { place: 'Tiệm Cà Phê Phố Cổ', dish: 'Cà phê trứng đặc sản', time: '10:30 AM' },
      { place: 'Nhà Hàng Ẩm Thực Bờ Hồ', dish: 'Bún chả nướng than hoa', time: '01:00 PM' },
      { place: 'Quán Ăn Vặt Nổi Tiếng', dish: 'Bánh tráng nướng & Chè hạt sen', time: '04:30 PM' },
      { place: 'Nhà Hàng Hải Sản Đêm', dish: 'Lẩu hải sản tươi sống', time: '07:30 PM' }
    ];

    const tripStops: TripStop[] = stops.map((stopName, idx) => {
      const recommendation = defaultDishes[idx % defaultDishes.length];
      return {
        stopOrder: idx + 1,
        stopName,
        recommendedPlace: `${recommendation.place} (${stopName})`,
        recommendedDish: recommendation.dish,
        estimatedTime: recommendation.time
      };
    });

    // Build Google Maps direction URL
    // Format: https://www.google.com/maps/dir/?api=1&origin=Stop1&destination=LastStop&waypoints=Stop2|Stop3
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
