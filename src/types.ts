export type Station = {
  id: string;
  name: string;
  coordinates: number[];
  prices: {
    Ysi5: number;
    Ysi8: number;
    Diesel: number;
  };
};

export type Fuel = "Ysi5" | "Ysi8" | "Diesel";
