# Expense Tracker Web Application

A complete expense tracking web application built with Node.js, Express, MongoDB, and vanilla JavaScript. Features a modern responsive UI with Chart.js analytics.

## Features

- **Add Expenses** - Record expenses with title, amount, category, date, and notes
- **Expense List** - View all expenses in a sortable table with edit/delete actions
- **Dashboard** - See summary cards showing total, today's, and monthly expenses
- **Charts & Analytics** - Pie chart for category distribution and bar chart for monthly trends
- **Filters** - Filter expenses by category, date range, and amount range
- **Search** - Search expenses by title
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Project Structure

```
expense-tracker/
├── models/
│   └── Expense.js          # MongoDB/Mongoose schema
├── routes/
│   └── expenseRoutes.js    # API routes
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css         # CSS styling
│   └── script.js          # Frontend JavaScript
├── server.js               # Express server
├── package.json            # Dependencies
└── README.md              # This file
```

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Installation

1. **Clone or download the project**

2. **Navigate to the project directory**
   ```bash
   cd expense-tracker
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)

2. Start MongoDB service:
   - Windows: `mongod` (run in command prompt)
   - macOS/Linux: `sudo mongod`

3. MongoDB will run on `mongodb://localhost:27017`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. Create a free cluster and get the connection string

3. Create a `.env` file in the project root:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense-tracker
   ```

## Running the Application

### Start the server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (with optional filters) |
| GET | `/api/expenses/summary` | Get dashboard summary |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Add new expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Query Parameters for GET /api/expenses

- `category` - Filter by category
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date (YYYY-MM-DD)
- `minAmount` - Filter by minimum amount
- `maxAmount` - Filter by maximum amount
- `search` - Search by title
- `sortBy` - Sort field (date, amount, title)
- `sortOrder` - Sort order (asc, desc)

### Example Request

```bash
# Get all food expenses
curl "http://localhost:3000/api/expenses?category=Food"

# Get expenses in date range
curl "http://localhost:3000/api/expenses?startDate=2024-01-01&endDate=2024-01-31"
```

## Expense Categories

- Food
- Travel
- Shopping
- Bills
- Entertainment
- Others

## Development

### Running in Development Mode

```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

## Troubleshooting

### MongoDB Connection Error

If you see "MongoDB connection error", make sure:
1. MongoDB is running
2. The connection string is correct
3. No firewall is blocking the connection

### Port Already in Use

If port 3000 is in use, change the PORT in `.env`:
```
PORT=3001
```

### Dependencies Issues

If you encounter issues, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Charts**: Chart.js
- **Fonts**: Inter (Google Fonts)

## License

ISC
