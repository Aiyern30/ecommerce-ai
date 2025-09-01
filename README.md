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

## 📄 Complete Page Structure

### 🏠 Customer Pages

#### Main Shopping Experience

- [`/`](app/page.tsx) - Homepage with AI-powered services showcase
- [`/products`](<app/(Customer)/products/page.tsx>) - Product catalog with smart filtering
- [`/products/[id]`](<app/(Customer)/products/[id]/page.tsx>) - Detailed product pages with AI recommendations
- [`/search`](<app/(Customer)/search/page.tsx>) - AI-powered image detection and product search
- [`/compare`](<app/(Customer)/compare/page.tsx>) - Intelligent product comparison with AI insights

#### Shopping & Orders

- [`/cart`](<app/(Customer)/cart/page.tsx>) - Smart shopping cart with recommendations
- [`/checkout`](<app/(Customer)/checkout/page.tsx>) - Streamlined checkout process
- [`/profile/orders`](<app/(Customer)/profile/orders/page.tsx>) - Order history and tracking
- [`/profile/wishlist`](<app/(Customer)/profile/wishlist/page.tsx>) - Saved products and favorites

#### Information & Support

- [`/blogs`](<app/(Customer)/blogs/page.tsx>) - Construction industry insights and guides
- [`/blogs/[id]`](<app/(Customer)/blogs/[id]/page.tsx>) - Detailed blog articles
- [`/faq`](<app/(Customer)/faq/page.tsx>) - Frequently asked questions
- [`/contact`](<app/(Customer)/contact/page.tsx>) - Contact information and support
- [`/about`](<app/(Customer)/about/page.tsx>) - Company information and values
- [`/terms`](<app/(Customer)/terms/page.tsx>) - Terms and conditions
- [`/privacy`](<app/(Customer)/privacy/page.tsx>) - Privacy policy and data protection

### 👨‍💼 Staff Management Portal

#### Dashboard & Analytics

- [`/staff/dashboard`](app/staff/dashboard/page.tsx) - Main staff dashboard with KPIs
- [`/staff/dashboard/ai-insights`](app/staff/dashboard/ai-insights/page.tsx) - AI-powered business insights and predictions

#### Product Management

- [`/staff/products`](app/staff/products/page.tsx) - Product catalog management
- [`/staff/products/new`](app/staff/products/new/page.tsx) - Add new products
- [`/staff/products/[id]/edit`](app/staff/products/[id]/edit/page.tsx) - Edit existing products

#### Content Management

- [`/staff/blogs`](app/staff/blogs/page.tsx) - Blog post management
- [`/staff/blogs/new`](app/staff/blogs/new/page.tsx) - Create new blog posts
- [`/staff/blogs/[id]/edit`](app/staff/blogs/[id]/edit/page.tsx) - Edit blog posts
- [`/staff/faqs`](app/staff/faqs/page.tsx) - FAQ management
- [`/staff/faqs/new`](app/staff/faqs/new/page.tsx) - Create new FAQs
- [`/staff/faqs/[id]/edit`](app/staff/faqs/[id]/edit/page.tsx) - Edit FAQs

#### Order & Customer Management

- [`/staff/orders`](app/staff/orders/page.tsx) - Order processing and management
- [`/staff/customers`](app/staff/customers/page.tsx) - Customer database and analytics

## 🛠️ Technology Stack

### 🎯 Frontend Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **UI Library**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom design system
- **Component Library**: shadcn/ui with custom components
- **Icons**: Lucide React Icons
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React Context and custom hooks

### 🤖 AI & Machine Learning

- **Primary AI**: Google Gemini 1.5 Flash for conversational AI
- **Computer Vision**: Google Cloud Vision API for image analysis
- **Intent Analysis**: Custom [`ConcreteIntentAnalyzer`](lib/gemini/concreteIntentAnalyzer.ts) for NLP
- **Recommendation Engine**: Custom ML algorithms in [`RecommendationEngine`](lib/recommendations/recommendationEngine.ts)
- **Predictive Analytics**: Custom algorithms for demand forecasting

### 📊 Data Visualization & Charts

- **Charts**: Recharts for responsive data visualization
- **Analytics Components**: Custom chart components in [`components/`](components/)
- **Real-time Updates**: Dynamic data visualization with live updates
- **Export Capabilities**: PDF and CSV export functionality

### 🗄️ Backend & Database

- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **Authentication**: Supabase Auth with row-level security
- **Storage**: Supabase Storage for images and files
- **API**: Next.js API Routes with TypeScript
- **Real-time**: Supabase Realtime for live updates

### 🔧 Development Tools

- **Package Manager**: npm/yarn
- **Code Quality**: ESLint and Prettier
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js built-in bundler
- **Development**: Hot reload and fast refresh

## 🎨 UI Components & Design System

### 📦 Core UI Components

- **Layout Components**: [`Header`](components/Header.tsx), [`Footer`](components/Footer.tsx)
- **Form Components**: [`Input`](components/ui/Input.tsx), [`Button`](components/ui/Button.tsx), [`Select`](components/ui/Select.tsx)
- **Data Display**: [`Card`](components/ui/Card.tsx), [`Badge`](components/ui/Badge.tsx), [`Table`](components/ui/Table.tsx)
- **Navigation**: [`BreadcrumbNav`](components/BreadcrumbNav.tsx), mobile-responsive menus
- **Feedback**: [`Toast`](components/ui/Toast.tsx), loading states, error boundaries

### 🎭 Specialized Components

- **AI Components**:

  - [`AISmartComparison`](components/AISmartComparison.tsx) - AI-powered product comparison
  - [`ChatContext`](components/ChatContext.tsx) - Chat state management
  - [`ProductRecommendations`](components/ProductRecommendations.tsx) - Smart recommendations

- **Business Components**:
  - [`ServicesShowcase`](components/ServicesShowcase.tsx) - AI services display
  - [`UseCases`](components/UseCases.tsx) - Industry use cases
  - [`WhyChooseUs`](components/WhyChooseUs.tsx) - Company advantages
  - [`StatsCards`](components/StatsCards.tsx) - Analytics dashboard cards

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
