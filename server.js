/**
 * Expense Tracker Server
 * Main Express server for the expense tracker application
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import expense routes
const expenseRoutes = require('./routes/expenseRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
// Default MongoDB connection string (can be overridden by environment variable)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('Please make sure MongoDB is running and accessible.');
    });

// mongoose connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// API Routes
app.use('/api/expenses', expenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Expense Tracker API is running',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve the main HTML file for all non-API routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`\n🚀 Expense Tracker Server is running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = app;
