import { Flight } from '../entities/flight.entity';
import { FlightSeat } from '../entities/flight-seat.entity';

type SeatLayout = {
  rows: number;
  seatsPerRow: number;
  aisleAfter: number[];
  businessClassRows: number;
  premiumEconomyRows: number;
  firstClassRows: number;
};

const LAYOUTS: Record<string, SeatLayout> = {
  // Airbus A320 layout (typical)
  'A320': {
    rows: 30,
    seatsPerRow: 6,
    aisleAfter: [3], // Aisle after column 3 (seats ABC DEF)
    businessClassRows: 0,
    premiumEconomyRows: 0,
    firstClassRows: 0,
  },
  // Boeing 777 layout (typical)
  'B777': {
    rows: 40,
    seatsPerRow: 9,
    aisleAfter: [3, 6], // Seats ABC DEFG HJK
    businessClassRows: 8,
    premiumEconomyRows: 10,
    firstClassRows: 4,
  },
  // Default layout (similar to A320)
  'DEFAULT': {
    rows: 25,
    seatsPerRow: 6,
    aisleAfter: [3],
    businessClassRows: 0,
    premiumEconomyRows: 0,
    firstClassRows: 0,
  },
};

const SEAT_LETTERS = 'ABCDEFGHJK';

export function generateSeats(flight: Flight): FlightSeat[] {
  const layout = LAYOUTS[flight.aircraftType] || LAYOUTS.DEFAULT;
  const seats: FlightSeat[] = [];
  
  let seatNumber = 1;
  
  for (let row = 1; row <= layout.rows; row++) {
    // Determine cabin class based on row
    let seatClass: 'economy' | 'premium_economy' | 'business' | 'first' = 'economy';
    
    if (row <= layout.firstClassRows) {
      seatClass = 'first';
    } else if (row <= layout.firstClassRows + layout.businessClassRows) {
      seatClass = 'business';
    } else if (row <= layout.firstClassRows + layout.businessClassRows + layout.premiumEconomyRows) {
      seatClass = 'premium_economy';
    }
    
    for (let col = 0; col < layout.seatsPerRow; col++) {
      const seatLetter = SEAT_LETTERS[col % SEAT_LETTERS.length];
      const seatCode = `${row}${seatLetter}`;
      
      // Determine seat type
      let seatType: 'window' | 'aisle' | 'middle' | 'exit' | 'bulkhead' = 'middle';
      
      if (col === 0 || col === layout.seatsPerRow - 1) {
        seatType = 'window';
      } else if (layout.aisleAfter.includes(col) || layout.aisleAfter.includes(col - 1)) {
        seatType = 'aisle';
      }
      
      // Mark exit rows
      const isExitRow = [5, 15, 25].includes(row);
      if (isExitRow) {
        seatType = 'exit';
      }
      
      // Calculate base price multiplier based on class and seat type
      const baseMultiplier = getBaseMultiplier(seatClass);
      const typeMultiplier = seatType === 'exit' || seatType === 'window' ? 1.1 : 1;
      const price = Math.round(flight.basePrice * baseMultiplier * typeMultiplier * 100) / 100;
      
      const seat = new FlightSeat();
      seat.flight = flight;
      seat.seatNumber = seatCode;
      seat.class = seatClass;
      seat.type = seatType;
      seat.price = price;
      seat.isWindowSeat = seatType === 'window';
      seat.isExitRow = isExitRow;
      seat.hasExtraLegroom = isExitRow;
      seat.isAvailable = true;
      seat.status = 'available';
      seat.features = [];
      
      if (isExitRow) {
        seat.features.push('extra_legroom');
      }
      
      seats.push(seat);
      seatNumber++;
    }
  }
  
  return seats;
}

function getBaseMultiplier(seatClass: string): number {
  switch (seatClass) {
    case 'first':
      return 3.5;
    case 'business':
      return 2.5;
    case 'premium_economy':
      return 1.5;
    case 'economy':
    default:
      return 1;
  }
}
