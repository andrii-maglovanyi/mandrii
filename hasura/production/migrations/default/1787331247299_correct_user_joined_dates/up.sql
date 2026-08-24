WITH first_contributions AS (
  SELECT user_id, MIN(created_at) AS first_contribution_at
  FROM (
    SELECT user_id, created_at FROM public.venues
    UNION ALL
    SELECT user_id, created_at FROM public.events
  ) AS contributions
  GROUP BY user_id
)
UPDATE public.users AS users
SET joined_at = CASE
  WHEN users."emailVerified" IS NULL THEN first_contributions.first_contribution_at
  WHEN first_contributions.first_contribution_at IS NULL THEN users."emailVerified"
  ELSE LEAST(users."emailVerified", first_contributions.first_contribution_at)
END
FROM first_contributions
WHERE users.id = first_contributions.user_id;
