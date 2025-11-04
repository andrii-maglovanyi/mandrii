-- Create price_type enum
CREATE TYPE public.price_type_enum AS ENUM (
  'FREE',
  'PAID',
  'DONATION',
  'SUGGESTED_DONATION'
);

-- Create price_type table for descriptions (optional, for UI)
CREATE TABLE public.price_type (
  value TEXT PRIMARY KEY,
  description TEXT
);

-- Insert price type values
INSERT INTO public.price_type (value, description) VALUES
  ('FREE', 'Free event with no cost'),
  ('PAID', 'Paid event with fixed ticket price'),
  ('DONATION', 'Donation-based event'),
  ('SUGGESTED_DONATION', 'Event with suggested donation amount');
