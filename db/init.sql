--
-- PostgreSQL database dump
--

\restrict LRy8vJxKxB0TbJkldHrjwDzCSqRjDNbd5WQR7LoTgZJk73bw59yoNOcuZ5Q77cV

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: robots; Type: TABLE; Schema: public; Owner: robot_master
--

CREATE TABLE public.robots (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    status character varying(10) NOT NULL,
    lat numeric(10,7) NOT NULL,
    lon numeric(10,7) NOT NULL,
    robot_positions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT robots_status_check CHECK (((status)::text = ANY ((ARRAY['idle'::character varying, 'moving'::character varying])::text[])))
);


ALTER TABLE public.robots OWNER TO robot_master;

--
-- Name: robots_id_seq; Type: SEQUENCE; Schema: public; Owner: robot_master
--

CREATE SEQUENCE public.robots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.robots_id_seq OWNER TO robot_master;

--
-- Name: robots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robot_master
--

ALTER SEQUENCE public.robots_id_seq OWNED BY public.robots.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: robot_master
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO robot_master;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: robot_master
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO robot_master;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robot_master
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: robots id; Type: DEFAULT; Schema: public; Owner: robot_master
--

ALTER TABLE ONLY public.robots ALTER COLUMN id SET DEFAULT nextval('public.robots_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: robot_master
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: robots; Type: TABLE DATA; Schema: public; Owner: robot_master
--

COPY public.robots (id, name, status, lat, lon, robot_positions, created_at, updated_at) FROM stdin;
10	R2-D2	idle	51.3408630	12.3759190	[]	2025-12-13 19:00:23.521287	2025-12-13 19:00:23.521287
11	Wall-E	idle	51.3408630	12.3759190	[]	2025-12-13 19:00:31.60552	2025-12-13 19:00:31.60552
12	Bender	idle	51.3408630	12.3759190	[]	2025-12-13 19:00:38.146063	2025-12-13 19:00:38.146063
13	Marvin	idle	51.3408630	12.3759190	[]	2025-12-13 19:00:42.195549	2025-12-13 19:00:42.195549
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: robot_master
--

COPY public.users (id, email, password_hash, created_at) FROM stdin;
1	admin@test.com	$2b$10$nPoFqcBSa4wrfUsAXDTeyeuxXN2KMFgbBcbttI0QG/KPq3JhtQH5K	2025-12-12 16:12:52.885883
\.


--
-- Name: robots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: robot_master
--

SELECT pg_catalog.setval('public.robots_id_seq', 13, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: robot_master
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: robots robots_pkey; Type: CONSTRAINT; Schema: public; Owner: robot_master
--

ALTER TABLE ONLY public.robots
    ADD CONSTRAINT robots_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: robot_master
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: robot_master
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict LRy8vJxKxB0TbJkldHrjwDzCSqRjDNbd5WQR7LoTgZJk73bw59yoNOcuZ5Q77cV

