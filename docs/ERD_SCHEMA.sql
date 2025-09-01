-- YTL Concrete Hub Database Schema for ERD Generation
-- This file contains the complete database schema with proper foreign key relationships
-- for generating ERD diagrams in draw.io or other ERD tools

-- Drop existing tables if they exist (for clean recreation)
DROP TABLE IF EXISTS blog_tags CASCADE;
DROP TABLE IF EXISTS blog_images CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS order_additional_services CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS faq CASCADE;
DROP TABLE IF EXISTS faq_sections CASCADE;
DROP TABLE IF EXISTS freight_charges CASCADE;
DROP TABLE IF EXISTS additional_services CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS publish_status CASCADE;

-- Create custom types
CREATE TYPE publish_status AS ENUM ('draft', 'published');

-- ================================
-- CORE TABLES
-- ================================

-- Users table (represents auth.users from Supabase)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- USER MANAGEMENT TABLES
-- ================================

-- User Addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'Malaysia',
    is_default BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_addresses_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- ================================
-- PRODUCT MANAGEMENT TABLES
-- ================================

-- Products Catalog
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    grade TEXT,
    product_type TEXT,
    mortar_ratio TEXT,
    category TEXT DEFAULT 'building_materials',
    normal_price NUMERIC(10,2),
    pump_price NUMERIC(10,2),
    tremie_1_price NUMERIC(10,2),
    tremie_2_price NUMERIC(10,2),
    tremie_3_price NUMERIC(10,2),
    unit TEXT DEFAULT 'per m³',
    stock_quantity INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Gallery
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_product_images_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE
);

-- ================================
-- SHOPPING CART TABLES
-- ================================

-- User Shopping Carts
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_carts_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variant_type TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_cart_items_cart 
        FOREIGN KEY (cart_id) 
        REFERENCES carts(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE CASCADE
);

-- ================================
-- ORDER MANAGEMENT TABLES
-- ================================

-- Customer Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    address_id UUID NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_intent_id TEXT,
    subtotal NUMERIC(10,2),
    shipping_cost NUMERIC(10,2),
    tax NUMERIC(10,2),
    total NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_orders_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_orders_address 
        FOREIGN KEY (address_id) 
        REFERENCES addresses(id) 
        ON DELETE RESTRICT
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    name TEXT NOT NULL,
    grade TEXT,
    variant_type TEXT,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_order_items_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE RESTRICT
);

-- ================================
-- BUSINESS SERVICES TABLES
-- ================================

-- Additional Services Catalog
CREATE TABLE additional_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    service_code TEXT NOT NULL UNIQUE,
    rate_per_m3 NUMERIC(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Additional Services
CREATE TABLE order_additional_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    additional_service_id UUID NOT NULL,
    service_name TEXT NOT NULL,
    rate_per_m3 NUMERIC(10,2) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_order_additional_services_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_order_additional_services_service 
        FOREIGN KEY (additional_service_id) 
        REFERENCES additional_services(id) 
        ON DELETE RESTRICT
);

-- Freight Charges Configuration
CREATE TABLE freight_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_volume NUMERIC(10,2) NOT NULL,
    max_volume NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- COMMUNICATION TABLES
-- ================================

-- User Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE SET NULL
);

-- Customer Enquiries
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    staff_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_enquiries_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- User Wishlists
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_type TEXT NOT NULL,
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_wishlists_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint for user + item combination
    CONSTRAINT uk_wishlists_user_item 
        UNIQUE(user_id, item_type, item_id)
);

-- ================================
-- CONTENT MANAGEMENT TABLES
-- ================================

-- FAQ Sections
CREATE TABLE faq_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Items
CREATE TABLE faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    status publish_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_faq_section 
        FOREIGN KEY (section_id) 
        REFERENCES faq_sections(id) 
        ON DELETE CASCADE
);

-- Tags for Content
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- Blog Posts
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    status publish_status DEFAULT 'draft',
    link_name TEXT,
    link TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Images
CREATE TABLE blog_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_blog_images_blog 
        FOREIGN KEY (blog_id) 
        REFERENCES blogs(id) 
        ON DELETE CASCADE
);

-- Blog Tags (Many-to-Many)
CREATE TABLE blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_blog_tags_blog 
        FOREIGN KEY (blog_id) 
        REFERENCES blogs(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_blog_tags_tag 
        FOREIGN KEY (tag_id) 
        REFERENCES tags(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate tag assignments
    CONSTRAINT uk_blog_tags_blog_tag 
        UNIQUE(blog_id, tag_id)
);

-- Marketing Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    mobile_description TEXT,
    link_name TEXT,
    link TEXT,
    image_url TEXT,
    status publish_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- User-related indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default);

-- Product-related indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);

-- Cart-related indexes
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Order-related indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Communication indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_enquiries_user_id ON enquiries(user_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);

-- Content indexes
CREATE INDEX idx_blog_images_blog_id ON blog_images(blog_id);
CREATE INDEX idx_blog_tags_blog_id ON blog_tags(blog_id);
CREATE INDEX idx_blog_tags_tag_id ON blog_tags(tag_id);
CREATE INDEX idx_faq_section_id ON faq(section_id);

-- Wishlist indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_item ON wishlists(item_type, item_id);

-- ================================
-- SAMPLE DATA FOR VISUALIZATION
-- ================================

-- Insert sample users
INSERT INTO users (id, email, full_name, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@ytl.com', 'Admin User', 'staff'),
    ('22222222-2222-2222-2222-222222222222', 'customer@example.com', 'John Doe', 'customer');

-- Insert sample products
INSERT INTO products (id, name, description, grade, product_type, normal_price) VALUES
    ('33333333-3333-3333-3333-333333333333', 'C25 Concrete', 'Standard concrete for general construction', 'C25', 'concrete', 280.00),
    ('44444444-4444-4444-4444-444444444444', 'C30 Concrete', 'High strength concrete for structural work', 'C30', 'concrete', 320.00);

-- Insert sample addresses
INSERT INTO addresses (user_id, full_name, phone, address_line1, city, state, postal_code, is_default) VALUES
    ('22222222-2222-2222-2222-222222222222', 'John Doe', '+60123456789', '123 Main Street', 'Kuala Lumpur', 'Selangor', '50000', true);

-- Insert sample FAQ section
INSERT INTO faq_sections (id, name) VALUES
    ('55555555-5555-5555-5555-555555555555', 'General Questions');

-- Insert sample FAQ
INSERT INTO faq (section_id, question, answer, status) VALUES
    ('55555555-5555-5555-5555-555555555555', 'What is concrete grade?', 'Concrete grade indicates the compressive strength of concrete.', 'published');

-- ================================
-- COMMENTS FOR ERD UNDERSTANDING
-- ================================

COMMENT ON TABLE users IS 'User accounts (customers and staff)';
COMMENT ON TABLE addresses IS 'User shipping and billing addresses';
COMMENT ON TABLE products IS 'Product catalog with multiple pricing tiers';
COMMENT ON TABLE product_images IS 'Product image gallery';
COMMENT ON TABLE carts IS 'User shopping carts (one per user)';
COMMENT ON TABLE cart_items IS 'Items in shopping carts';
COMMENT ON TABLE orders IS 'Customer orders with payment tracking';
COMMENT ON TABLE order_items IS 'Products in orders with historical pricing';
COMMENT ON TABLE additional_services IS 'Additional services catalog';
COMMENT ON TABLE order_additional_services IS 'Additional services applied to orders';
COMMENT ON TABLE notifications IS 'User notifications system';
COMMENT ON TABLE enquiries IS 'Customer support tickets';
COMMENT ON TABLE wishlists IS 'User wishlists for products and content';
COMMENT ON TABLE blogs IS 'Blog posts and articles';
COMMENT ON TABLE blog_images IS 'Blog post images';
COMMENT ON TABLE blog_tags IS 'Many-to-many relationship between blogs and tags';
COMMENT ON TABLE faq IS 'Frequently asked questions';
COMMENT ON TABLE faq_sections IS 'FAQ organization sections';
COMMENT ON TABLE posts IS 'Marketing posts and announcements';
