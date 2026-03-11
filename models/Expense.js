/**
 * Expense Model
 * Mongoose schema for storing expense records
 */

const mongoose = require('mongoose');

// Define the expense schema
const expenseSchema = new mongoose.Schema({
    // Title of the expense (required)
    title: {
        type: String,
        required: [true, 'Please provide an expense title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },

    // Amount of the expense (required)
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
        min: [0, 'Amount cannot be negative'],
        validate: {
            validator: function (value) {
                return value > 0;
            },
            message: 'Amount must be greater than 0'
        }
    },

    // Category of the expense (required)
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'],
        default: 'Others'
    },

    // Date of the expense (required)
    date: {
        type: Date,
        required: [true, 'Please provide a date'],
        default: Date.now
    },

    // Optional notes for the expense
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        default: ''
    },

    // Timestamp for record creation
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Timestamp for last update
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update the updatedAt field
expenseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better query performance on date and category
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdAt: -1 });

// Create the Expense model from the schema
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
