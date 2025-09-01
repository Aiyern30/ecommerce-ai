# YTL Concrete Hub - Row Level Security (RLS) Policies

This document provides comprehensive documentation for all Row Level Security policies implemented in the YTL Concrete Hub database.

## 🔐 Policy Overview

The YTL Concrete Hub platform implements comprehensive Row Level Security policies to ensure data privacy, security, and proper access control. All policies are designed around two main user roles: **customers** and **staff**.

## 🏛️ Policy Architecture

### User Role Detection

The system uses JWT token metadata to identify user roles:

- **Customer Role**: Default authenticated users
- **Staff Role**: Users with `auth.jwt().app_metadata.role = 'staff'` or `auth.jwt().user_metadata.role = 'staff'`

### Policy Categories

1. **Public Read**: Tables accessible to all users
2. **User Ownership**: Users can only access their own data
3. **Staff Management**: Staff can manage all data
4. **System Operations**: Automated system operations

## 📋 Complete Policy Documentation

### 🏠 User Management Policies

#### `addresses` Table

| Policy Name                              | Command | Condition                                | Description                                |
| ---------------------------------------- | ------- | ---------------------------------------- | ------------------------------------------ |
| **Select own addresses**                 | SELECT  | `true`                                   | Users can view all addresses (public read) |
| **Users can read their own addresses**   | SELECT  | `auth.uid() = user_id`                   | Users can view their own addresses         |
| **Insert own addresses**                 | INSERT  | `auth.uid() = user_id`                   | Users can create addresses for themselves  |
| **Users can insert their own addresses** | INSERT  | `auth.uid() = user_id`                   | Duplicate policy for address creation      |
| **Update own addresses**                 | UPDATE  | `auth.uid() = user_id`                   | Users can modify their own addresses       |
| **Users can update their own addresses** | UPDATE  | `auth.uid() = user_id`                   | Duplicate policy for address updates       |
| **Delete own addresses**                 | DELETE  | `auth.uid() = user_id`                   | Users can delete their own addresses       |
| **Staff can read all addresses**         | SELECT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can view all customer addresses      |
| **Staff can update all addresses**       | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can modify any address               |

**Business Logic:**

- Users have full control over their personal addresses
- Staff can access all addresses for order management
- Supports both public and private address viewing

#### `carts` Table

| Policy Name                       | Command | Condition              | Description                 |
| --------------------------------- | ------- | ---------------------- | --------------------------- |
| **Allow user to read own carts**  | SELECT  | `user_id = auth.uid()` | Users can view their cart   |
| **Allow user to insert own cart** | INSERT  | `user_id = auth.uid()` | Users can create their cart |
| **Allow user to update own cart** | UPDATE  | `user_id = auth.uid()` | Users can modify their cart |
| **Allow user to delete own cart** | DELETE  | `user_id = auth.uid()` | Users can clear their cart  |

**Business Logic:**

- Strict ownership model - users only access their own cart
- No staff override for cart management (privacy)

#### `notifications` Table

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

#### `wishlists` Table

| Policy Name                              | Command | Condition              | Description                         |
| ---------------------------------------- | ------- | ---------------------- | ----------------------------------- |
| **Users can view their own wishlists**   | SELECT  | `auth.uid() = user_id` | Users can view their wishlist items |
| **Users can insert their own wishlists** | INSERT  | `auth.uid() = user_id` | Users can add items to wishlist     |
| **Users can delete their own wishlists** | DELETE  | `auth.uid() = user_id` | Users can remove wishlist items     |

**Business Logic:**

- Personal wishlist management
- No update policy (delete and re-insert pattern)
- Privacy-focused - no staff access

### 🛍️ Product Catalog Policies

#### `products` Table

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

#### `product_images` Table

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

### 🛒 Order Management Policies

#### `orders` Table

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

#### `order_items` Table

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

#### `order_additional_services` Table

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

### 📝 Content Management Policies

#### `blogs` Table

| Policy Name                        | Command | Condition                                | Description                 |
| ---------------------------------- | ------- | ---------------------------------------- | --------------------------- |
| **Authenticated can select blogs** | SELECT  | `true`                                   | Anyone can read blog posts  |
| **Staff can insert blogs**         | INSERT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can create blog posts |
| **Staff can update blogs**         | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can edit blog posts   |
| **Staff can delete blogs**         | DELETE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can remove blog posts |

#### `blog_images` Table

| Policy Name                              | Command | Condition                                | Description                  |
| ---------------------------------------- | ------- | ---------------------------------------- | ---------------------------- |
| **Authenticated can select blog_images** | SELECT  | `true`                                   | Anyone can view blog images  |
| **Staff can insert blog_images**         | INSERT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can upload blog images |
| **Staff can update blog_images**         | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can modify blog images |
| **Staff can delete blog_images**         | DELETE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can remove blog images |

#### `blog_tags` Table

| Policy Name                            | Command | Condition                                | Description                       |
| -------------------------------------- | ------- | ---------------------------------------- | --------------------------------- |
| **Authenticated can select blog_tags** | SELECT  | `true`                                   | Anyone can view blog tags         |
| **Staff can insert blog_tags**         | INSERT  | `auth.jwt().app_metadata.role = 'staff'` | Staff can create tag associations |
| **Staff can update blog_tags**         | UPDATE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can modify tag associations |
| **Staff can delete blog_tags**         | DELETE  | `auth.jwt().app_metadata.role = 'staff'` | Staff can remove tag associations |

#### `posts` Table

| Policy Name                     | Command | Condition                                 | Description                     |
| ------------------------------- | ------- | ----------------------------------------- | ------------------------------- |
| **Public read access to posts** | SELECT  | `true`                                    | Anyone can read marketing posts |
| **Staff can insert posts**      | INSERT  | `auth.jwt().user_metadata.role = 'staff'` | Staff can create posts          |
| **Staff can update posts**      | UPDATE  | `auth.jwt().user_metadata.role = 'staff'` | Staff can edit posts            |
| **Staff can delete posts**      | DELETE  | `auth.jwt().user_metadata.role = 'staff'` | Staff can remove posts          |

### ❓ FAQ Management Policies

#### `faq` Table

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

#### `faq_sections` Table

| Policy Name                       | Command | Condition               | Description                  |
| --------------------------------- | ------- | ----------------------- | ---------------------------- |
| **Public can view FAQ sections**  | SELECT  | `true`                  | Anyone can view FAQ sections |
| **Staff can insert FAQ sections** | INSERT  | `auth.role() = 'staff'` | Staff can create sections    |
| **Staff can update FAQ sections** | UPDATE  | `auth.role() = 'staff'` | Staff can modify sections    |
| **Staff can delete FAQ sections** | DELETE  | `auth.role() = 'staff'` | Staff can remove sections    |

### 📞 Customer Service Policies

#### `enquiries` Table

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

## 🔧 Policy Implementation Notes

### Role Authentication Patterns

The system uses several patterns for role detection:

1. **App Metadata**: `auth.jwt().app_metadata.role = 'staff'`
2. **User Metadata**: `auth.jwt().user_metadata.role = 'staff'`
3. **Direct Role**: `auth.role() = 'staff'`

### Common Policy Patterns

#### Ownership Validation

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

#### Staff Authorization

```sql
-- Standard staff check
auth.jwt().app_metadata.role = 'staff'

-- Alternative staff checks
auth.jwt().user_metadata.role = 'staff'
auth.role() = 'staff'
```

#### Public Access

```sql
-- Universal access
true

-- Authenticated users only
auth.role() = 'authenticated'
```

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Principle of Least Privilege**: Users can only access their own data
2. **Role-Based Access Control**: Staff have elevated permissions
3. **Data Isolation**: Customer data is isolated between accounts
4. **Public Content**: Product and content data is publicly readable
5. **Audit Trail**: All policies are logged and trackable

### Recommendations for Improvement

1. **Consolidate Duplicate Policies**: Remove redundant policies in FAQ table
2. **Standardize Role Checks**: Use consistent role detection pattern
3. **Review Public Insert Policies**: Ensure FAQ public insert is intentional
4. **Add Policy Documentation**: Document business justification for each policy
5. **Regular Security Audits**: Periodic review of policy effectiveness

## 📊 Policy Summary by Table

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

---

## 📞 Support

For policy-related questions or security concerns, contact the development team or refer to the [Supabase RLS documentation](https://supabase.com/docs/guides/auth/row-level-security).
