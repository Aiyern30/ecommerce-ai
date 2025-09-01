# Ecommerce AI Dashboard

This project is a modern ecommerce analytics dashboard built with Next.js, React, and TypeScript. It provides real-time insights into revenue, orders, and other key metrics, leveraging Supabase for backend data and advanced charting libraries for visualization.

## Features

- Revenue analytics over time with smart period grouping
- Orders and payment status tracking
- Responsive UI for desktop and mobile
- Interactive charts (Recharts)
- Customizable stats cards
- Supabase integration for data management
- Modern UI components (shadcn/ui, Lucide icons)

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Lucide icons
- **Charts:** Recharts
- **Backend:** Supabase
- **API:** RESTful endpoints for analytics

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase project & credentials

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ecommerce-ai.git
   cd ecommerce-ai/ecommerce-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:

   Create a `.env.local` file and add your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `components/` - Reusable React components (Dashboard, StatsCards, etc.)
- `pages/` - Next.js pages and API routes
- `utils/` - Utility functions and hooks
- `lib/` - Shared libraries (currency formatting, etc.)
- `public/` - Static assets

## Customization

- Update UI components in `components/` for branding
- Modify Supabase queries in API routes for custom analytics
- Extend charting features in dashboard components

## Deployment

You can deploy this project on Vercel, Netlify, or any platform supporting Next.js.

## License

MIT

## Credits

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Recharts](https://recharts.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
