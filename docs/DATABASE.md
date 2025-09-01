# YTL Concrete Hub - Database Documentation

This document provides comprehensive documentation for the YTL Concrete Hub database schema, built on Supabase (PostgreSQL).

## 📊 Database Overview

The database is designed to support a comprehensive concrete and construction materials ecommerce platform with the following key areas:

- **Product Management**: Products, categories, pricing, and inventory
- **User Management**: Customer accounts, addresses, and preferences
- **Order Processing**: Shopping carts, orders, payments, and fulfillment
- **Content Management**: Blogs, FAQs, and marketing content
- **Business Logic**: Additional services, freight charges, and notifications

## 📚 Related Documentation

### Security & Access Control

- **[RLS Policies Documentation](POLICIES.md)** - Complete Row Level Security policies and implementation details

### Database Functions

- **[Functions Documentation](FUNCTIONS.md)** - All custom database functions, triggers, and analytics functions

### Database Queries

For common database queries and examples, refer to the individual documentation files above.

## 🗂️ Database Schema

### 🛍️ Product Management Tables

#### `products`

Main product catalog table storing concrete and mortar products.

| Column           | Type        | Description                                          |
| ---------------- | ----------- | ---------------------------------------------------- |
| `id`             | uuid        | Primary key, auto-generated                          |
| `name`           | text        | Product name                                         |
| `description`    | text        | Detailed product description                         |
| `grade`          | text        | Concrete/mortar grade (C25, C30, etc.)               |
| `product_type`   | text        | Product category: 'concrete' or 'mortar'             |
| `mortar_ratio`   | text        | Mortar mixing ratio (for mortar products)            |
| `category`       | text        | Product category, default: 'building_materials'      |
| `normal_price`   | numeric     | Price for normal truck delivery                      |
| `pump_price`     | numeric     | Price for pump delivery                              |
| `tremie_1_price` | numeric     | Tremie delivery tier 1 price                         |
| `tremie_2_price` | numeric     | Tremie delivery tier 2 price                         |
| `tremie_3_price` | numeric     | Tremie delivery tier 3 price                         |
| `unit`           | text        | Unit of measurement, default: 'per m³'               |
| `stock_quantity` | integer     | Available inventory                                  |
| `status`         | text        | Publication status: 'draft', 'published', 'archived' |
| `is_featured`    | boolean     | Featured product flag                                |
| `keywords`       | text[]      | Search keywords array                                |
| `is_active`      | boolean     | Active status                                        |
| `created_at`     | timestamptz | Creation timestamp                                   |
| `updated_at`     | timestamptz | Last update timestamp                                |

**Business Logic:**

- Multiple pricing tiers support different delivery methods
- Stock tracking for inventory management
- Flexible product categorization for concrete and mortar

#### `product_images`

Product image gallery with sorting and primary image designation.

| Column       | Type        | Description                   |
| ------------ | ----------- | ----------------------------- |
| `id`         | uuid        | Primary key                   |
| `product_id` | uuid        | Foreign key to products table |
| `image_url`  | text        | Image storage URL             |
| `alt_text`   | text        | Accessibility alt text        |
| `is_primary` | boolean     | Primary product image flag    |
| `sort_order` | integer     | Display order                 |
| `created_at` | timestamptz | Upload timestamp              |

**Relationships:**

- `product_id` → `products.id` (CASCADE DELETE)

### 👥 User Management Tables

#### `addresses`

Customer shipping and billing addresses with soft delete support.

| Column          | Type        | Description                  |
| --------------- | ----------- | ---------------------------- |
| `id`            | uuid        | Primary key                  |
| `user_id`       | uuid        | Foreign key to auth.users    |
| `full_name`     | text        | Recipient full name          |
| `phone`         | text        | Contact phone number         |
| `address_line1` | text        | Primary address line         |
| `address_line2` | text        | Secondary address line       |
| `city`          | text        | City name                    |
| `state`         | text        | State/province               |
| `postal_code`   | text        | Postal/ZIP code              |
| `country`       | text        | Country, default: 'Malaysia' |
| `is_default`    | boolean     | Default address flag         |
| `deleted_at`    | timestamptz | Soft delete timestamp        |
| `created_at`    | timestamptz | Creation timestamp           |
| `updated_at`    | timestamptz | Last update timestamp        |

**Business Logic:**

- Supports multiple addresses per user
- Default address selection
- Soft delete for data integrity

### 🛒 Shopping & Orders Tables

#### `carts`

User shopping carts with one-to-one user relationship.

| Column       | Type        | Description                        |
| ------------ | ----------- | ---------------------------------- |
| `id`         | uuid        | Primary key                        |
| `user_id`    | uuid        | Foreign key to auth.users (UNIQUE) |
| `created_at` | timestamptz | Creation timestamp                 |
| `updated_at` | timestamptz | Last update timestamp              |

**Business Logic:**

- One cart per user (enforced by UNIQUE constraint)
- Persistent cart across sessions

#### `cart_items`

Individual items within shopping carts.

| Column         | Type        | Description                   |
| -------------- | ----------- | ----------------------------- |
| `id`           | uuid        | Primary key                   |
| `cart_id`      | uuid        | Foreign key to carts table    |
| `product_id`   | uuid        | Foreign key to products table |
| `variant_type` | text        | Delivery method variant       |
| `quantity`     | integer     | Item quantity                 |
| `selected`     | boolean     | Item selection for checkout   |
| `created_at`   | timestamptz | Addition timestamp            |
| `updated_at`   | timestamptz | Last update timestamp         |

**Relationships:**

- `cart_id` → `carts.id`
- `product_id` → `products.id`

#### `orders`

Main order processing table with comprehensive status tracking.

| Column              | Type        | Description                                                                |
| ------------------- | ----------- | -------------------------------------------------------------------------- |
| `id`                | uuid        | Primary key                                                                |
| `user_id`           | uuid        | Foreign key to auth.users                                                  |
| `status`            | text        | Order status: 'pending', 'processing', 'shipped', 'delivered', 'cancelled' |
| `payment_status`    | text        | Payment status: 'pending', 'paid', 'failed', 'refunded'                    |
| `payment_intent_id` | text        | Stripe payment intent ID                                                   |
| `subtotal`          | numeric     | Order subtotal                                                             |
| `shipping_cost`     | numeric     | Delivery charges                                                           |
| `tax`               | numeric     | Tax amount                                                                 |
| `total`             | numeric     | Total order amount                                                         |
| `notes`             | text        | Customer notes                                                             |
| `address_id`        | uuid        | Foreign key to addresses table                                             |
| `created_at`        | timestamptz | Order creation timestamp                                                   |
| `updated_at`        | timestamptz | Last update timestamp                                                      |

**Relationships:**

- `user_id` → `auth.users.id`
- `address_id` → `addresses.id`

**Business Logic:**

- Comprehensive order lifecycle tracking
- Integrated payment processing with Stripe
- Flexible pricing with tax and shipping calculations

#### `order_items`

Individual products within orders with historical pricing.

| Column         | Type        | Description                    |
| -------------- | ----------- | ------------------------------ |
| `id`           | uuid        | Primary key                    |
| `order_id`     | uuid        | Foreign key to orders table    |
| `product_id`   | uuid        | Foreign key to products table  |
| `name`         | text        | Product name at time of order  |
| `grade`        | text        | Product grade at time of order |
| `variant_type` | text        | Delivery method selected       |
| `price`        | numeric     | Price at time of order         |
| `quantity`     | integer     | Quantity ordered               |
| `image_url`    | text        | Product image at time of order |
| `created_at`   | timestamptz | Creation timestamp             |

**Business Logic:**

- Historical price preservation
- Product snapshot for order integrity

### 💼 Business Services Tables

#### `additional_services`

Configurable additional services with per-cubic-meter pricing.

| Column         | Type        | Description               |
| -------------- | ----------- | ------------------------- |
| `id`           | uuid        | Primary key               |
| `service_name` | text        | Service name              |
| `service_code` | text        | Unique service identifier |
| `rate_per_m3`  | numeric     | Price per cubic meter     |
| `description`  | text        | Service description       |
| `is_active`    | boolean     | Service availability      |
| `created_at`   | timestamptz | Creation timestamp        |
| `updated_at`   | timestamptz | Last update timestamp     |

#### `order_additional_services`

Additional services applied to specific orders.

| Column                  | Type        | Description                              |
| ----------------------- | ----------- | ---------------------------------------- |
| `id`                    | uuid        | Primary key                              |
| `order_id`              | uuid        | Foreign key to orders table              |
| `additional_service_id` | uuid        | Foreign key to additional_services table |
| `service_name`          | text        | Service name at time of order            |
| `rate_per_m3`           | numeric     | Rate at time of order                    |
| `quantity`              | numeric     | Service quantity (cubic meters)          |
| `total_price`           | numeric     | Calculated service cost                  |
| `created_at`            | timestamptz | Creation timestamp                       |

#### `freight_charges`

Tiered delivery pricing based on order volume.

| Column         | Type        | Description                   |
| -------------- | ----------- | ----------------------------- |
| `id`           | uuid        | Primary key                   |
| `min_volume`   | numeric     | Minimum volume for this tier  |
| `max_volume`   | numeric     | Maximum volume for this tier  |
| `delivery_fee` | numeric     | Delivery charge for this tier |
| `description`  | text        | Tier description              |
| `is_active`    | boolean     | Tier availability             |
| `created_at`   | timestamptz | Creation timestamp            |
| `updated_at`   | timestamptz | Last update timestamp         |

### 📝 Content Management Tables

#### `blogs`

Blog posts and articles with publication workflow.

| Column        | Type           | Description                              |
| ------------- | -------------- | ---------------------------------------- |
| `id`          | uuid           | Primary key                              |
| `title`       | text           | Blog post title                          |
| `description` | text           | Short description/excerpt                |
| `content`     | text           | Full blog content                        |
| `status`      | publish_status | Publication status: 'draft', 'published' |
| `link_name`   | text           | SEO-friendly URL slug                    |
| `link`        | text           | External link (if applicable)            |
| `image_url`   | text           | Featured image URL                       |
| `created_at`  | timestamptz    | Creation timestamp                       |
| `updated_at`  | timestamptz    | Last update timestamp                    |

#### `blog_images`

Additional images for blog posts.

| Column       | Type        | Description                |
| ------------ | ----------- | -------------------------- |
| `id`         | uuid        | Primary key                |
| `blog_id`    | uuid        | Foreign key to blogs table |
| `image_url`  | text        | Image storage URL          |
| `created_at` | timestamptz | Upload timestamp           |

#### `tags`

Reusable tags for content categorization.

| Column | Type | Description       |
| ------ | ---- | ----------------- |
| `id`   | uuid | Primary key       |
| `name` | text | Tag name (UNIQUE) |

#### `blog_tags`

Many-to-many relationship between blogs and tags.

| Column    | Type | Description                |
| --------- | ---- | -------------------------- |
| `id`      | uuid | Primary key                |
| `blog_id` | uuid | Foreign key to blogs table |
| `tag_id`  | uuid | Foreign key to tags table  |

#### `faq_sections`

FAQ organization sections.

| Column       | Type        | Description           |
| ------------ | ----------- | --------------------- |
| `id`         | uuid        | Primary key           |
| `name`       | text        | Section name (UNIQUE) |
| `created_at` | timestamptz | Creation timestamp    |

#### `faq`

Frequently asked questions with sectional organization.

| Column       | Type           | Description                       |
| ------------ | -------------- | --------------------------------- |
| `id`         | uuid           | Primary key                       |
| `question`   | text           | FAQ question                      |
| `answer`     | text           | FAQ answer                        |
| `section_id` | uuid           | Foreign key to faq_sections table |
| `status`     | publish_status | Publication status                |
| `created_at` | timestamptz    | Creation timestamp                |
| `updated_at` | timestamptz    | Last update timestamp             |

#### `posts`

Marketing posts and announcements.

| Column               | Type           | Description                  |
| -------------------- | -------------- | ---------------------------- |
| `id`                 | uuid           | Primary key                  |
| `title`              | text           | Post title                   |
| `description`        | text           | Desktop description          |
| `mobile_description` | text           | Mobile-optimized description |
| `link_name`          | text           | URL slug                     |
| `link`               | text           | External link                |
| `image_url`          | text           | Featured image               |
| `status`             | publish_status | Publication status           |
| `created_at`         | timestamptz    | Creation timestamp           |
| `updated_at`         | timestamptz    | Last update timestamp        |

### 🔔 Communication Tables

#### `notifications`

System notifications for users.

| Column       | Type        | Description                                                              |
| ------------ | ----------- | ------------------------------------------------------------------------ |
| `id`         | uuid        | Primary key                                                              |
| `user_id`    | uuid        | Foreign key to auth.users                                                |
| `title`      | text        | Notification title                                                       |
| `message`    | text        | Notification content                                                     |
| `type`       | text        | Notification type: 'order', 'promotion', 'system', 'payment', 'shipping' |
| `read`       | boolean     | Read status                                                              |
| `order_id`   | uuid        | Related order (optional)                                                 |
| `created_at` | timestamptz | Creation timestamp                                                       |
| `updated_at` | timestamptz | Last update timestamp                                                    |

#### `enquiries`

Customer service enquiries and support tickets.

| Column        | Type        | Description                     |
| ------------- | ----------- | ------------------------------- |
| `id`          | uuid        | Primary key                     |
| `user_id`     | uuid        | Foreign key to auth.users       |
| `name`        | text        | Customer name                   |
| `email`       | text        | Contact email                   |
| `subject`     | text        | Enquiry subject                 |
| `message`     | text        | Enquiry message                 |
| `status`      | text        | Enquiry status, default: 'open' |
| `staff_reply` | text        | Staff response                  |
| `created_at`  | timestamptz | Creation timestamp              |
| `updated_at`  | timestamptz | Last update timestamp           |

#### `wishlists`

User wishlists for products and content.

| Column       | Type        | Description                    |
| ------------ | ----------- | ------------------------------ |
| `id`         | uuid        | Primary key                    |
| `user_id`    | uuid        | Foreign key to auth.users      |
| `item_type`  | text        | Item type: 'blog' or 'product' |
| `item_id`    | uuid        | ID of the wishlist item        |
| `created_at` | timestamptz | Addition timestamp             |
| `updated_at` | timestamptz | Last update timestamp          |

## 🏗️ Custom Types

### `publish_status`

Enumeration for content publication workflow:

- `draft`: Content in development
- `published`: Live content

## 🔗 Quick Reference

### View All Functions

```sql
SELECT routine_name, routine_type, data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### View All Policies

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### View Table Relationships

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

| --------------------------------- | ------- | ---------------------- | --------------------------- |
| **Allow user to read own carts** | SELECT | `user_id = auth.uid()` | Users can view their cart |
| **Allow user to insert own cart** | INSERT | `user_id = auth.uid()` | Users can create their cart |
| **Allow user to update own cart** | UPDATE | `user_id = auth.uid()` | Users can modify their cart |
| **Allow user to delete own cart** | DELETE | `user_id = auth.uid()` | Users can clear their cart |

**Business Logic:**

- Strict ownership model - users only access their own cart
- No staff override for cart management (privacy)

##### `notifications` Table

| Policy Name                                  | Command | Condition              | Description                                  |
| -------------------------------------------- | ------- | ---------------------- | -------------------------------------------- |
| **Allow user to read own notifications**     | SELECT  | `user_id = auth.uid()` | Users can view their notifications           |
| **Users can view their own notifications**   | SELECT  | `auth.uid() = user_id` | Duplicate read policy                        |
| **Allow user to insert own notifications**   | INSERT  | `user_id = auth.uid()` | Users can create notifications               |
| **Allow user to update own notifications**   | UPDATE  | `user_id = auth.uid()` | Users can mark notifications as read         |
| **Users can update their own notifications** | UPDATE  | `auth.uid() = user_id` | Duplicate update policy                      |
| **Allow user to delete own notifications**   | DELETE  | `user_id = auth.uid()` | Users can delete notifications               |
| **Users can delete their own notifications** | DELETE  | `user_id = auth.uid()` | Duplicate delete policy                      |
| **System can insert notifications**          | INSERT  | `true`                 | System can create notifications for any user |
| **System can update notifications**          | UPDATE  | `true`                 | System can update notification status        |

**Business Logic:**

- Users have full control over their notifications
- System can create/update notifications for automated processes
- No staff access to user notifications (privacy)

##### `wishlists` Table

| Policy Name                              | Command | Condition              | Description                         |
| ---------------------------------------- | ------- | ---------------------- | ----------------------------------- |
| **Users can view their own wishlists**   | SELECT  | `auth.uid() = user_id` | Users can view their wishlist items |
| **Users can insert their own wishlists** | INSERT  | `auth.uid() = user_id` | Users can add items to wishlist     |
| **Users can delete their own wishlists** | DELETE  | `auth.uid() = user_id` | Users can remove wishlist items     |

**Business Logic:**

- Personal wishlist management
- No update policy (delete and re-insert pattern)
- Privacy-focused - no staff access

#### 🛍️ Product Catalog Policies

##### `products` Table

| Policy Name                              | Command | Condition               | Description               |
| ---------------------------------------- | ------- | ----------------------- | ------------------------- |
| **Allow public read access to products** | SELECT  | `true`                  | Anyone can view products  |
| **Allow staff to insert products**       | INSERT  | `auth.role() = 'staff'` | Staff can create products |
| **Allow staff to update products**       | UPDATE  | `auth.role() = 'staff'` | Staff can modify products |
| **Allow staff to delete products**       | DELETE  | `auth.role() = 'staff'` | Staff can remove products |

**Business Logic:**

- Public product catalog for browsing
- Staff-only product management
- No customer product modifications

##### `product_images` Table

| Policy Name                                    | Command | Condition               | Description                     |
| ---------------------------------------------- | ------- | ----------------------- | ------------------------------- |
| **Allow public read access to product_images** | SELECT  | `true`                  | Anyone can view product images  |
| **Allow staff to insert product_images**       | INSERT  | `auth.role() = 'staff'` | Staff can upload product images |
| **Allow staff to update product_images**       | UPDATE  | `auth.role() = 'staff'` | Staff can modify image metadata |
| **Allow staff to delete product_images**       | DELETE  | `auth.role() = 'staff'` | Staff can remove product images |

**Business Logic:**

- Public image access for product browsing
- Staff-only image management
- Supports product image galleries

#### 🛒 Order Management Policies

##### `orders` Table

| Policy Name                               | Command | Condition                                | Description                                    |
| ----------------------------------------- | ------- | ---------------------------------------- | ---------------------------------------------- |
| **Users can read their own orders**       | SELECT  | `auth.uid() = user_id`                   | Users can view their order history             |
| **Users can insert their own orders**     | INSERT  | `auth.uid() = user_id`                   | Users can create orders                        |
| **Users can update their own orders**     | UPDATE  | `auth.uid() = user_id`                   | Users can modify pending orders                |
| **Staff can read all orders**             | SELECT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can view all orders                      |
| **Staff can create orders for customers** | INSERT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can create orders on behalf of customers |
| **Staff can update all orders**           | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can modify any order                     |
| **Staff can delete orders**               | DELETE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can cancel/remove orders                 |

**Business Logic:**

- Users manage their own orders
- Staff have full order management capabilities
- Order lifecycle tracking and management

##### `order_items` Table

| Policy Name                                       | Command | Condition                                                                                              | Description                          |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| **Users can read their own order items**          | SELECT  | `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())` | Users can view items in their orders |
| **Users can insert their own order items**        | INSERT  | `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())` | Users can add items to their orders  |
| **Users can create order items for their orders** | INSERT  | `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())` | Duplicate insert policy              |
| **Staff can read all order items**                | SELECT  | `auth.jwt().app_metadata.role = 'staff'`                                                               | Staff can view all order items       |
| **Staff can insert order items**                  | INSERT  | `auth.jwt().app_metadata.role = 'staff'`                                                               | Staff can add items to any order     |
| **Staff can create any order items**              | INSERT  | `auth.jwt().app_metadata.role = 'staff'`                                                               | Duplicate staff insert policy        |
| **Staff can update all order items**              | UPDATE  | `auth.jwt().app_metadata.role = 'staff'`                                                               | Staff can modify any order item      |
| **Staff can delete order items**                  | DELETE  | `auth.jwt().app_metadata.role = 'staff'`                                                               | Staff can remove order items         |

**Business Logic:**

- Complex ownership validation through order relationship
- Users can only modify items in their own orders
- Staff have full order item management

##### `order_additional_services` Table

| Policy Name                                              | Command | Condition                                                                                                            | Description                             |
| -------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Users can read their own order additional services**   | SELECT  | `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_additional_services.order_id AND orders.user_id = auth.uid())` | Users can view services on their orders |
| **Users can insert their own order additional services** | INSERT  | `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_additional_services.order_id AND orders.user_id = auth.uid())` | Users can add services to their orders  |
| **Staff can read all order additional services**         | SELECT  | `auth.jwt().app_metadata.role = 'staff'`                                                                             | Staff can view all additional services  |
| **Staff can insert order additional services**           | INSERT  | `auth.jwt().app_metadata.role = 'staff'`                                                                             | Staff can add services to any order     |
| **Staff can update all order additional services**       | UPDATE  | `auth.jwt().app_metadata.role = 'staff'`                                                                             | Staff can modify service details        |
| **Staff can delete order additional services**           | DELETE  | `auth.jwt().app_metadata.role = 'staff'`                                                                             | Staff can remove services               |

**Business Logic:**

- Service management tied to order ownership
- Additional services like delivery upgrades
- Staff can manage all service assignments

#### 📝 Content Management Policies

##### `blogs` Table

| Policy Name                        | Command | Condition                                | Description                 |
| ---------------------------------- | ------- | ---------------------------------------- | --------------------------- |
| **Authenticated can select blogs** | SELECT  | `true`                                   | Anyone can read blog posts  |
| **Staff can insert blogs**         | INSERT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can create blog posts |
| **Staff can update blogs**         | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can edit blog posts   |
| **Staff can delete blogs**         | DELETE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can remove blog posts |

##### `blog_images` Table

| Policy Name                              | Command | Condition                                | Description                  |
| ---------------------------------------- | ------- | ---------------------------------------- | ---------------------------- |
| **Authenticated can select blog_images** | SELECT  | `true`                                   | Anyone can view blog images  |
| **Staff can insert blog_images**         | INSERT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can upload blog images |
| **Staff can update blog_images**         | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can modify blog images |
| **Staff can delete blog_images**         | DELETE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can remove blog images |

##### `blog_tags` Table

| Policy Name                            | Command | Condition                                | Description                       |
| -------------------------------------- | ------- | ---------------------------------------- | --------------------------------- |
| **Authenticated can select blog_tags** | SELECT  | `true`                                   | Anyone can view blog tags         |
| **Staff can insert blog_tags**         | INSERT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can create tag associations |
| **Staff can update blog_tags**         | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can modify tag associations |
| **Staff can delete blog_tags**         | DELETE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can remove tag associations |

##### `posts` Table

| Policy Name                     | Command | Condition                                 | Description                     |
| ------------------------------- | ------- | ----------------------------------------- | ------------------------------- |
| **Public read access to posts** | SELECT  | `true`                                    | Anyone can read marketing posts |
| **Staff can insert posts**      | INSERT  | `auth.jwt().user_metadata.role = 'staff'` | Staff can create posts          |
| **Staff can update posts**      | UPDATE  | `auth.jwt().user_metadata.role = 'staff'` | Staff can edit posts            |
| **Staff can delete posts**      | DELETE  | `auth.jwt().user_metadata.role = 'staff'` | Staff can remove posts          |

#### ❓ FAQ Management Policies

##### `faq` Table

_Note: This table has multiple overlapping policies that should be consolidated_

| Policy Name                        | Command | Condition                                 | Description                   |
| ---------------------------------- | ------- | ----------------------------------------- | ----------------------------- |
| **Allow all to read FAQs**         | SELECT  | `true`                                    | Public FAQ access             |
| **Public can view FAQs**           | SELECT  | `true`                                    | Duplicate public read policy  |
| **Allow select for all**           | SELECT  | `true`                                    | Another duplicate public read |
| **Staff can manage FAQs**          | ALL     | `auth.jwt().user_metadata.role = 'staff'` | Staff full access             |
| **Staff can insert FAQs**          | INSERT  | `auth.role() = 'staff'`                   | Staff can create FAQs         |
| **Staff can update FAQ**           | UPDATE  | Multiple staff role checks                | Staff can edit FAQs           |
| **Staff can update FAQs**          | UPDATE  | `auth.role() = 'staff'`                   | Duplicate staff update        |
| **Allow insert for all**           | INSERT  | `true`                                    | Public FAQ creation (risky)   |
| **Allow insert for authenticated** | INSERT  | `auth.role() = 'authenticated'`           | Authenticated FAQ creation    |

**⚠️ Security Recommendation:**
The FAQ table has redundant and potentially insecure policies. Consider consolidating to:

- Public SELECT access
- Staff-only INSERT/UPDATE/DELETE access

##### `faq_sections` Table

| Policy Name                       | Command | Condition               | Description                  |
| --------------------------------- | ------- | ----------------------- | ---------------------------- |
| **Public can view FAQ sections**  | SELECT  | `true`                  | Anyone can view FAQ sections |
| **Staff can insert FAQ sections** | INSERT  | `auth.role() = 'staff'` | Staff can create sections    |
| **Staff can update FAQ sections** | UPDATE  | `auth.role() = 'staff'` | Staff can modify sections    |
| **Staff can delete FAQ sections** | DELETE  | `auth.role() = 'staff'` | Staff can remove sections    |

#### 📞 Customer Service Policies

##### `enquiries` Table

| Policy Name                        | Command | Condition                                 | Description                          |
| ---------------------------------- | ------- | ----------------------------------------- | ------------------------------------ |
| **Users can select own enquiry**   | SELECT  | `auth.uid() = user_id`                    | Users can view their support tickets |
| **Users can insert own enquiry**   | INSERT  | `auth.uid() = user_id`                    | Users can create support tickets     |
| **Users can update own enquiry**   | UPDATE  | `auth.uid() = user_id`                    | Users can modify their tickets       |
| **Users can delete own enquiry**   | DELETE  | `auth.uid() = user_id`                    | Users can cancel their tickets       |
| **Staff can select all enquiries** | SELECT  | `auth.jwt().user_metadata.role = 'staff'` | Staff can view all support tickets   |
| **Staff can update all enquiries** | UPDATE  | `auth.jwt().user_metadata.role = 'staff'` | Staff can respond to tickets         |
| **Staff can delete all enquiries** | DELETE  | `auth.jwt().user_metadata.role = 'staff'` | Staff can close tickets              |

**Business Logic:**

- Customer self-service for support tickets
- Staff can manage all customer enquiries
- Full ticket lifecycle management

### 🔧 Policy Implementation Notes

#### Role Authentication Patterns

The system uses several patterns for role detection:

1. **App Metadata**: `auth.jwt().app_metadata.role = 'staff'`
2. **User Metadata**: `auth.jwt().user_metadata.role = 'staff'`
3. **Direct Role**: `auth.role() = 'staff'`

#### Common Policy Patterns

##### Ownership Validation

```sql
-- Direct user ownership
auth.uid() = user_id

-- Related table ownership (orders -> order_items)
EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = order_items.order_id
  AND orders.user_id = auth.uid()
)
```

##### Staff Authorization

```sql
-- Standard staff check
auth.jwt().app_metadata.role = 'staff'

-- Alternative staff checks
auth.jwt().user_metadata.role = 'staff'
auth.role() = 'staff'
```

##### Public Access

```sql
-- Universal access
true

-- Authenticated users only
auth.role() = 'authenticated'
```

### 🔒 Security Best Practices

#### Implemented Security Measures

1. **Principle of Least Privilege**: Users can only access their own data
2. **Role-Based Access Control**: Staff have elevated permissions
3. **Data Isolation**: Customer data is isolated between accounts
4. **Public Content**: Product and content data is publicly readable
5. **Audit Trail**: All policies are logged and trackable

#### Recommendations for Improvement

1. **Consolidate Duplicate Policies**: Remove redundant policies in FAQ table
2. **Standardize Role Checks**: Use consistent role detection pattern
3. **Review Public Insert Policies**: Ensure FAQ public insert is intentional
4. **Add Policy Documentation**: Document business justification for each policy
5. **Regular Security Audits**: Periodic review of policy effectiveness

### 📊 Policy Summary by Table

| Table                       | Public Read | User CRUD     | Staff Management | Notes                  |
| --------------------------- | ----------- | ------------- | ---------------- | ---------------------- |
| `addresses`                 | ✅          | ✅ Own data   | ✅ All data      | Customer addresses     |
| `carts`                     | ❌          | ✅ Own data   | ❌               | Private shopping carts |
| `notifications`             | ❌          | ✅ Own data   | ❌ System only   | User notifications     |
| `wishlists`                 | ❌          | ✅ Own data   | ❌               | Personal wishlists     |
| `products`                  | ✅          | ❌            | ✅ All data      | Product catalog        |
| `product_images`            | ✅          | ❌            | ✅ All data      | Product images         |
| `orders`                    | ❌          | ✅ Own data   | ✅ All data      | Order management       |
| `order_items`               | ❌          | ✅ Own orders | ✅ All data      | Order contents         |
| `order_additional_services` | ❌          | ✅ Own orders | ✅ All data      | Order services         |
| `blogs`                     | ✅          | ❌            | ✅ All data      | Blog content           |
| `blog_images`               | ✅          | ❌            | ✅ All data      | Blog images            |
| `blog_tags`                 | ✅          | ❌            | ✅ All data      | Blog categorization    |
| `posts`                     | ✅          | ❌            | ✅ All data      | Marketing posts        |
| `faq`                       | ✅          | ⚠️ Risky      | ✅ All data      | FAQ content            |
| `faq_sections`              | ✅          | ❌            | ✅ All data      | FAQ organization       |
| `enquiries`                 | ❌          | ✅ Own data   | ✅ All data      | Customer support       |

**Legend:**

- ✅ = Allowed
- ❌ = Not allowed
- ⚠️ = Security concern
