export type SensorDataRow = {
  id: number;
  suhu: number;
  kelembaban: number;
  ldr: string;
  created_at: string;
};

export type SensorDataInsert = {
  suhu: number;
  kelembaban: number;
  ldr: string;
};
