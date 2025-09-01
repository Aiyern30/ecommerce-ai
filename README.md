# YTL Concrete Hub - AI-Powered Ecommerce Platform

A comprehensive concrete and construction materials ecommerce platform powered by artificial intelligence, built with Next.js 14, React, and TypeScript. This platform provides intelligent product recommendations, AI-powered image detection, smart chatbot assistance, and advanced analytics for the construction industry.

## 🤖 Advanced AI Features

### 🧠 AI-Powered Product Search & Detection

- **Computer Vision Image Analysis**: Upload construction site photos for AI-powered product detection using Google Cloud Vision API
- **Smart Product Matching**: Automatically identify concrete types, grades, and quantities needed from construction images
- **Confidence Scoring**: AI provides confidence levels for detection accuracy with detailed analysis metadata
- **Project Complexity Assessment**: AI evaluates project complexity (low/medium/high) based on detected elements
- **Quantity Estimation**: Intelligent volume calculations based on detected construction elements

### 💬 Intelligent Chatbot System

- **Context-Aware Conversations**: AI chatbot powered by Google Gemini 1.5 Flash with construction industry expertise
- **Intent Analysis**: Advanced natural language processing using [`ConcreteIntentAnalyzer`](lib/gemini/concreteIntentAnalyzer.ts)
- **Smart Product Recommendations**: Contextual product suggestions based on user queries
- **Multi-Intent Detection**: Handles complex queries involving grades, pricing, delivery, and technical specifications
- **Conversation Memory**: Maintains conversation history for better context understanding

### 🔍 Smart Comparison Engine

- **AI Product Comparison**: Intelligent side-by-side product analysis using AI insights
- **Technical Specification Analysis**: Detailed comparison of concrete grades, ratios, and properties
- **Cost-Benefit Analysis**: AI-generated recommendations for optimal product selection
- **Use Case Recommendations**: Specific application suggestions for each product type

### 📊 Predictive Analytics & Business Intelligence

- **Daily AI Summaries**: Automated business performance analysis and insights
- **Demand Forecasting**: Predict product demand spikes and inventory needs
- **Stock Risk Alerts**: AI-powered low stock and overstock predictions
- **Sales Trend Analysis**: Intelligent pattern recognition for business optimization
- **Customer Behavior Insights**: AI-driven customer analytics and segmentation

### 🎯 Advanced Recommendation System

- **Product Recommendation Engine**: Sophisticated algorithms in [`RecommendationEngine`](lib/recommendations/recommendationEngine.ts)
- **Alternative Product Suggestions**: Smart alternatives based on grade compatibility
- **Complementary Products**: Related product recommendations for complete project solutions
- **Price-Performance Optimization**: Best value recommendations based on project requirements

## 📊 Key Features Deep Dive

### 🏗️ Construction Industry Specialization

#### Smart Product Catalog

- **Concrete Grade Categorization**: C25, C30, C35, C40, C45 grades with detailed specifications
- **Application-Based Filtering**: Foundation, structural, architectural concrete products
- **Technical Documentation**: Comprehensive product datasheets and certification
- **Real-Time Inventory**: Live stock levels with delivery availability

#### Intelligent Calculators

- **Concrete Volume Calculator**: Precise volume calculations for different construction shapes
- **Mortar Ratio Calculator**: Mix ratio optimization for various applications
- **Project Timeline Estimator**: AI-powered construction timeline predictions
- **Cost Estimation Tools**: Detailed cost breakdowns including delivery and labor

#### Delivery Management

- **Multi-Modal Delivery**: Normal truck, pump, and tremie delivery options
- **Route Optimization**: AI-powered delivery route planning
- **Real-Time Tracking**: GPS tracking for concrete delivery trucks
- **Scheduling System**: Advanced booking system with time slot management

### 🛒 Advanced Ecommerce Capabilities

#### Smart Shopping Experience

- **Persistent Shopping Cart**: Cross-device cart synchronization
- **Bulk Order Processing**: Special handling for large construction projects
- **Quote Management**: Instant quotations with detailed pricing breakdowns
- **Wishlist & Favorites**: Save products for future projects

#### Payment & Checkout

- **Multiple Payment Methods**: Credit card, bank transfer, corporate accounts
- **Flexible Billing**: Per-project billing and corporate invoicing
- **Credit Management**: Business credit lines and payment terms
- **Order Confirmation**: Automated confirmations with project details

#### Customer Account Management

- **Project Organization**: Organize orders by construction projects
- **Order History**: Comprehensive order tracking and history
- **Delivery Preferences**: Saved delivery addresses and preferences
- **Communication Hub**: Direct communication with delivery teams

### 🎨 User Experience Excellence

#### Responsive Design System

- **Mobile-First Architecture**: Optimized for construction site usage
- **Touch-Friendly Interface**: Large buttons and easy navigation for gloved hands
- **Offline Capabilities**: Progressive Web App with offline functionality
- **Fast Loading**: Optimized performance for slow construction site networks

#### Accessibility Features

- **WCAG 2.1 Compliance**: Full accessibility standards compliance
- **Keyboard Navigation**: Complete keyboard-only navigation support
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **High Contrast Mode**: Enhanced visibility for outdoor usage

#### Personalization

- **User Preferences**: Customizable dashboard and feature preferences
- **Project Templates**: Save and reuse common project configurations
- **Notification Settings**: Customizable alerts for orders and deliveries
- **Language Support**: Multi-language support for diverse teams

### 📈 Analytics & Business Intelligence

#### Real-Time Dashboards

- **Live Sales Metrics**: Real-time revenue and order tracking
- **Inventory Monitoring**: Stock levels with automated reorder alerts
- **Customer Analytics**: Behavior patterns and segmentation analysis
- **Performance KPIs**: Key performance indicators with trend analysis

#### Predictive Insights

- **Demand Forecasting**: ML-powered demand prediction models
- **Seasonal Trends**: Construction industry seasonal pattern analysis
- **Market Intelligence**: Competitive pricing and market trend analysis
- **Risk Assessment**: Financial and operational risk evaluation

#### Reporting System

- **Custom Reports**: Flexible report builder with multiple formats
- **Automated Reporting**: Scheduled reports with email delivery
- **Export Capabilities**: PDF, Excel, CSV export options
- **Visual Analytics**: Interactive charts and data visualizations

## 🌟 Platform Features

### 🏗️ Construction-Specific Functionality

- **Concrete Grade Calculator**: Interactive grade selection and specification tools
- **Mortar Ratio Calculator**: Precise ratio calculations for different applications
- **Delivery Method Options**: Normal, pump, and tremie delivery with pricing
- **Project Timeline Estimation**: AI-calculated construction timelines
- **Special Considerations**: Context-aware construction recommendations

### 🛒 Enhanced Ecommerce Features

- **Smart Shopping Cart**: Persistent cart with quantity optimization
- **Price Comparison Tools**: Compare prices across different grades and delivery methods
- **Bulk Order Management**: Specialized tools for large construction projects
- **Instant Quotations**: Real-time pricing with delivery calculations
- **Order Tracking**: Comprehensive order status monitoring

### 📱 Responsive Design & UX

- **Mobile-First Design**: Optimized for construction site usage
- **Dark/Light Theme**: Adaptive theming with user preferences
- **Progressive Web App**: Offline capabilities for field usage
- **Touch-Friendly Interface**: Designed for tablet and mobile construction use
- **Accessibility Features**: WCAG compliant design

## 📁 Project Structure

```
ecommerce-ai/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard routes
│   ├── ai/                      # AI-powered pages
│   ├── api/                     # API routes
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard components
│   ├── charts/                  # Chart components
│   ├── ai/                      # AI-related components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase client & queries
│   ├── ai/                     # AI service integrations
│   ├── utils/                  # General utilities
│   └── validations/            # Form validations
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
├── public/                      # Static assets
├── styles/                      # Additional stylesheets
└── docs/                        # Documentation
    └── DATABASE.md              # Comprehensive database documentation
```

## 📚 Documentation

### Database Documentation

For detailed information about the database schema, tables, relationships, and policies, see:

- [Database Documentation](docs/DATABASE.md) - Complete database schema and usage guide

### API Documentation

- [API Reference](docs/API.md) - Complete API endpoint documentation (coming soon)
- [AI Services](docs/AI.md) - AI and machine learning features guide (coming soon)

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js: v18+ (recommended v20+)
- Package Manager: npm or yarn
- Database: Supabase project setup
- AI Services: Google Cloud Project with Vision API enabled
- Environment: Modern browser with ES2020+ support

### ⚙️ Environment Configuration

```typescript
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PRIVATE_KEY=your-private-key
GOOGLE_CLOUD_CLIENT_EMAIL=your-client-email

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
```

### 🛠️ Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ytl-concrete-hub.git
cd ytl-concrete-hub
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Set Up the Database

- Import the database schema from Supabase dashboard
- Or use the provided SQL scripts

```bash
npm run db:setup
```

#### 4. Configure Google Cloud Services

- Enable Vision API in Google Cloud Console
- Create a service account and download credentials
- Set up authentication using the credentials

#### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

#### 6. Access the Application

```bash
Frontend: http://localhost:3000
Staff Portal: http://localhost:3000/staff
```

---

### 🎨 Design Features

- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Theme System**: Dark/light mode with CSS variables
- **Typography**: Custom typography system with [`Typography`](components/ui/Typography.tsx)
- **Color Palette**: Construction industry-focused color scheme
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🔌 API Architecture

### 🧠 AI API Endpoints

```typescript
// AI-powered chatbot
POST / api / gemini;
// Image detection and analysis
POST / api / detect;
// Product comparison AI
POST / api / ai - comparison;
// Business insights generation
GET / api / ai - insights / general;
GET / api / ai - insights / daily - summary;
GET / api / ai - insights / predictive - alerts;
```

### 📊 Data API Endpoints

```typescript
// Product management
GET / api / products;
POST / api / products;
PUT / api / products / [id];
DELETE / api / products / [id];

// Order processing
GET / api / orders;
POST / api / orders;
PUT / api / orders / [id];

// User management
GET / api / users;
POST / api / users;
PUT / api / users / [id];

// Analytics
GET / api / analytics / sales;
GET / api / analytics / products;
GET / api / analytics / customers;
```

### 🔧 Utility APIs

```typescript
// Content management
GET / api / blogs;
POST / api / blogs;
GET / api / faqs;
POST / api / faqs;

// File uploads
POST / api / upload;
GET / api / files / [id];

// External integrations
POST / api / webhooks / payment;
POST / api / notifications;
```

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js: v18+ (recommended v20+)
- Package Manager: npm or yarn
- Database: Supabase project setup
- AI Services: Google Cloud Project with Vision API enabled
- Environment: Modern browser with ES2020+ support

### ⚙️ Environment Configuration

```typescript
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PRIVATE_KEY=your-private-key
GOOGLE_CLOUD_CLIENT_EMAIL=your-client-email

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
```

### 🛠️ Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ytl-concrete-hub.git
cd ytl-concrete-hub
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Set Up the Database

- Import the database schema from Supabase dashboard
- Or use the provided SQL scripts

```bash
npm run db:setup
```

#### 4. Configure Google Cloud Services

- Enable Vision API in Google Cloud Console
- Create a service account and download credentials
- Set up authentication using the credentials

#### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

#### 6. Access the Application

```bash
Frontend: http://localhost:3000
Staff Portal: http://localhost:3000/staff
```

---
