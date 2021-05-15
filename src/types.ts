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
