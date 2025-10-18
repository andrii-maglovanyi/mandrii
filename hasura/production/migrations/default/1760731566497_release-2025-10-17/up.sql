SET transaction_timeout = 0;
SET check_function_bodies = false;
CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
CREATE FUNCTION public.update_users_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    "userId" uuid NOT NULL
);
CREATE TABLE public.provider_type (
    value text NOT NULL
);
CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" uuid NOT NULL,
    expires timestamp with time zone NOT NULL
);
CREATE TABLE public.user_role (
    value text NOT NULL,
    description text
);
CREATE TABLE public.user_status (
    value text NOT NULL,
    description text
);
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying,
    email text NOT NULL,
    "emailVerified" timestamp with time zone,
    image text,
    role text DEFAULT 'user'::text NOT NULL,
    status text DEFAULT 'inactive'::text NOT NULL
);
CREATE TABLE public.venue_category (
    value text NOT NULL
);
CREATE TABLE public.venue_status (
    value text NOT NULL,
    description text
);
CREATE TABLE public.venues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description_en text,
    description_uk text,
    category text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    country text,
    city text,
    postcode text,
    address text,
    geo public.geography(Point,4326),
    phone_numbers text[],
    emails text[],
    website text,
    social_links json DEFAULT json_build_object() NOT NULL,
    logo_url text,
    image_urls text[],
    slug text NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    owner_id uuid
);
CREATE TABLE public.verification_tokens (
    token text NOT NULL,
    identifier text NOT NULL,
    expires timestamp with time zone NOT NULL
);
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.provider_type
    ADD CONSTRAINT provider_type_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY ("sessionToken");
ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.user_status
    ADD CONSTRAINT user_status_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.venue_category
    ADD CONSTRAINT venue_category_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venue_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venue_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.venue_status
    ADD CONSTRAINT venue_status_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (token);
CREATE INDEX idx_accounts_provider_provideraccountid ON public.accounts USING btree (provider, "providerAccountId");
CREATE INDEX idx_sessions_sessiontoken ON public.sessions USING btree ("sessionToken");
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_status ON public.users USING btree (status);
CREATE INDEX idx_venue_category ON public.venues USING btree (category);
CREATE INDEX idx_venue_city ON public.venues USING btree (city);
CREATE INDEX idx_venue_geo ON public.venues USING gist (geo);
CREATE INDEX idx_venue_slug ON public.venues USING btree (slug);
CREATE INDEX idx_venue_status ON public.venues USING btree (status);
CREATE INDEX idx_verification_tokens_identifier_token ON public.verification_tokens USING btree (identifier, token);
CREATE TRIGGER update_timestamp BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_type_fkey FOREIGN KEY (type) REFERENCES public.provider_type(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_role FOREIGN KEY (role) REFERENCES public.user_role(value);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_status FOREIGN KEY (status) REFERENCES public.user_status(value);
ALTER TABLE ONLY public.venues
    ADD CONSTRAINT fk_venue_category FOREIGN KEY (category) REFERENCES public.venue_category(value);
ALTER TABLE ONLY public.venues
    ADD CONSTRAINT fk_venue_status FOREIGN KEY (status) REFERENCES public.venue_status(value);
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;
