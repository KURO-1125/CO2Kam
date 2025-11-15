# CO2Kam - Carbon Footprint Tracker for India

CO2Kam is a comprehensive web application designed specifically for users in India to track, visualize, and reduce their carbon footprint. The application provides real-time carbon emission calculations using India-specific emission factors.

## 🌱 Features

- **Real-time Carbon Tracking**: Track daily activities and get instant CO₂ equivalent calculations
- **India-Specific Data**: Uses emission factors tailored for the Indian context
- **Interactive Visualizations**: Beautiful charts and graphs to visualize your environmental impact
- **Activity Categories**: 
  - 🚗 Transportation (Cars, Motorcycles, Trains, Flights)
  - ⚡ Energy & Utilities (Electricity consumption)
  - 🏠 Household (LPG, Natural Gas)
  - 🍽️ Food & Diet (Rice, Wheat, Pulses, Meat, Dairy)
- **Carbon Offset Suggestions**: Get personalized recommendations for offsetting emissions
- **User Profiles**: Set goals and track progress over time
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Frontend (React + Vite)
- **Location**: `carbon-client/`
- **Tech Stack**: React 19, Vite, Chart.js, React Router
- **Styling**: Custom CSS with modern glass-morphism design
- **Authentication**: Supabase Auth integration

### Backend (Node.js + Express)
- **Location**: `carbon-server/`
- **Tech Stack**: Node.js, Express, Supabase
- **APIs**: Climatiq API for emission calculations
- **Database**: Supabase (PostgreSQL)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Climatiq API key (optional, for emission calculations)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd co2kam
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd carbon-server
   npm install

   # Install client dependencies
   cd ../carbon-client
   npm install
   ```

3. **Environment Setup**
   
   **Server Environment** (`carbon-server/.env`):
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CLIMATIQ_API_KEY=your_climatiq_api_key
   ```

   **Client Environment** (`carbon-client/.env`):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Database Setup**
   ```bash
   # Run the database migration
   cd carbon-server
   # Execute the SQL files in your Supabase dashboard:
   # - database-schema.sql
   # - database-migration.sql
   ```

5. **Start the application**
   ```bash
   # Start the server (from carbon-server directory)
   npm run dev

   # Start the client (from carbon-client directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Add Activities**: Select activity types and input values (distance, consumption, etc.)
3. **View Results**: See real-time CO₂ calculations and cumulative emissions
4. **Analyze Trends**: Use the dashboard to visualize your carbon footprint over time
5. **Set Goals**: Configure monthly carbon reduction goals
6. **Explore Offsets**: Discover carbon offset projects in India

## 🛠️ Development

### Project Structure
```
co2kam/
├── carbon-client/          # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── auth/          # Authentication logic
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── carbon-server/          # Node.js backend
│   ├── index.js           # Main server file
│   ├── auth-middleware.js # Authentication middleware
│   ├── climatiq-service.js # External API integration
│   └── *.sql             # Database schemas
└── README.md
```

### Available Scripts

**Client (carbon-client/)**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Server (carbon-server/)**:
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🌍 Emission Factors

CO2Kam uses India-specific emission factors from the Climatiq API:
- **Electricity**: Grid mix for India
- **Transportation**: Indian vehicle emission standards
- **Food**: Local agricultural and livestock data
- **Household**: LPG and natural gas consumption patterns

## 🔒 Security

- Environment variables for sensitive data
- JWT-based authentication
- API key protection through backend proxy
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## Demo

See the app in action:  
[Watch the Demo](https://drive.google.com/file/d/1ooYYmu9AGHlCpOBkiIXDR_npy_lWqLLL/view?usp=sharing)

**Made with 💚 for a sustainable future in India**
