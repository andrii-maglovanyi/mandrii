export type Json =
  | { [key: string]: Json }
  | boolean
  | Json[]
  | null
  | number
  | string;
