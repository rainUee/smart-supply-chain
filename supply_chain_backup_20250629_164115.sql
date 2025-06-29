--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS smart_supply_chain;
--
-- Name: smart_supply_chain; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE smart_supply_chain WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


\connect smart_supply_chain

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: orderstatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.orderstatus AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


--
-- Name: paymentstatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.paymentstatus AS ENUM (
    'PENDING',
    'PAID',
    'PARTIAL',
    'REFUNDED'
);


--
-- Name: purchaseorderstatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.purchaseorderstatus AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'ORDERED',
    'PARTIALLY_RECEIVED',
    'RECEIVED',
    'CANCELLED'
);


--
-- Name: transactiontype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transactiontype AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT',
    'TRANSFER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    transaction_type public.transactiontype NOT NULL,
    warehouse_location character varying(100),
    shelf_location character varying(100),
    reference_number character varying(100),
    reference_type character varying(50),
    unit_cost double precision,
    total_cost double precision,
    batch_number character varying(100),
    expiry_date timestamp without time zone,
    condition character varying(50),
    notes text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price double precision NOT NULL,
    total_price double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(100) NOT NULL,
    customer_name character varying(200) NOT NULL,
    customer_email character varying(255),
    customer_phone character varying(20),
    customer_address text,
    status public.orderstatus,
    payment_status public.paymentstatus,
    subtotal double precision,
    tax_amount double precision,
    shipping_amount double precision,
    discount_amount double precision,
    total_amount double precision,
    shipping_method character varying(100),
    tracking_number character varying(100),
    estimated_delivery timestamp without time zone,
    actual_delivery timestamp without time zone,
    notes text,
    user_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    sku character varying(100) NOT NULL,
    description text,
    category character varying(100),
    brand character varying(100),
    cost_price double precision NOT NULL,
    selling_price double precision NOT NULL,
    wholesale_price double precision,
    current_stock integer,
    min_stock_level integer,
    max_stock_level integer,
    reorder_point integer,
    unit_of_measure character varying(20),
    weight double precision,
    dimensions character varying(100),
    is_active boolean,
    is_featured boolean,
    supplier_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_cost double precision NOT NULL,
    total_cost double precision NOT NULL,
    received_quantity integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    po_number character varying(100) NOT NULL,
    supplier_id integer NOT NULL,
    status public.purchaseorderstatus,
    order_date timestamp without time zone NOT NULL,
    expected_delivery timestamp without time zone,
    subtotal double precision,
    tax_amount double precision,
    shipping_amount double precision,
    discount_amount double precision,
    total_amount double precision,
    shipping_address text,
    shipping_method character varying(100),
    approved_by integer,
    approved_at timestamp without time zone,
    notes text,
    terms_conditions text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    contact_person character varying(200),
    email character varying(255),
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    tax_id character varying(100),
    payment_terms character varying(100),
    credit_limit double precision,
    rating double precision,
    is_active boolean,
    is_preferred boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(200),
    is_active boolean,
    is_superuser boolean,
    role character varying(50),
    company character varying(200),
    phone character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alembic_version (version_num) FROM stdin;
814b8609dab0
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_items (id, product_id, quantity, transaction_type, warehouse_location, shelf_location, reference_number, reference_type, unit_cost, total_cost, batch_number, expiry_date, condition, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, customer_name, customer_email, customer_phone, customer_address, status, payment_status, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, shipping_method, tracking_number, estimated_delivery, actual_delivery, notes, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, sku, description, category, brand, cost_price, selling_price, wholesale_price, current_stock, min_stock_level, max_stock_level, reorder_point, unit_of_measure, weight, dimensions, is_active, is_featured, supplier_id, created_at, updated_at) FROM stdin;
1	Sample Product	SAMPLE-001	A sample product for testing	Electronics	\N	50	75	\N	1000	10	\N	20	pcs	\N	\N	t	f	1	2025-06-29 00:24:39.596918-03	2025-06-29 14:27:14.904118-03
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_cost, total_cost, received_quantity, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, po_number, supplier_id, status, order_date, expected_delivery, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, shipping_address, shipping_method, approved_by, approved_at, notes, terms_conditions, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, name, contact_person, email, phone, address, city, state, country, postal_code, tax_id, payment_terms, credit_limit, rating, is_active, is_preferred, created_at, updated_at) FROM stdin;
1	Sample Supplier	John Doe	john@supplier.com	+1234567890	123 Supplier St	Supplier City	\N	USA	\N	\N	\N	0	4.5	t	t	2025-06-29 00:23:56.591863-03	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, name, hashed_password, full_name, is_active, is_superuser, role, company, phone, created_at, updated_at) FROM stdin;
1	admin@demo.com	admin	$2b$12$nHMQLDnRbpkwAaBsdjMqsu1AmNWd73smEO6PrSXWGD5feeQkoykVa	System Administrator	t	t	admin	\N	\N	2025-06-29 00:23:56.345619-03	\N
\.


--
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 1, true);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 1, false);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_inventory_items_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_inventory_items_id ON public.inventory_items USING btree (id);


--
-- Name: ix_order_items_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_order_items_id ON public.order_items USING btree (id);


--
-- Name: ix_orders_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_orders_id ON public.orders USING btree (id);


--
-- Name: ix_orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: ix_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_category ON public.products USING btree (category);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_name ON public.products USING btree (name);


--
-- Name: ix_products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_products_sku ON public.products USING btree (sku);


--
-- Name: ix_purchase_order_items_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_purchase_order_items_id ON public.purchase_order_items USING btree (id);


--
-- Name: ix_purchase_orders_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_purchase_orders_id ON public.purchase_orders USING btree (id);


--
-- Name: ix_purchase_orders_po_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_purchase_orders_po_number ON public.purchase_orders USING btree (po_number);


--
-- Name: ix_suppliers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_suppliers_email ON public.suppliers USING btree (email);


--
-- Name: ix_suppliers_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_suppliers_id ON public.suppliers USING btree (id);


--
-- Name: ix_suppliers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_suppliers_name ON public.suppliers USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_name ON public.users USING btree (name);


--
-- Name: inventory_items inventory_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products products_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- Name: purchase_orders purchase_orders_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- PostgreSQL database dump complete
--

