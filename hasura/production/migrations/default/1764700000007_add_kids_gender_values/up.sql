-- Add kids-specific gender values to clothing_gender enum
-- Boys and Girls are used for kids clothing, while Men/Women are for adults

INSERT INTO public.clothing_gender (value, label_en, label_uk, sort_order) VALUES
    ('boys', 'Boys', 'Хлопчики', 4),
    ('girls', 'Girls', 'Дівчатка', 5)
ON CONFLICT (value) DO NOTHING;
