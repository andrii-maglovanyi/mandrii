-- Remove kids-specific gender values
DELETE FROM public.clothing_gender WHERE value IN ('boys', 'girls');
