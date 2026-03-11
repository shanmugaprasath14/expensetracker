/**
 * Expense Routes
 * API endpoints for expense CRUD operations
 */

const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Middleware to validate expense data
const validateExpense = (req, res, next) => {
    const { title, amount, category, date } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Please provide an expense title'
        });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid amount'
        });
    }

    if (!category) {
        return res.status(400).json({
            success: false,
            message: 'Please select a category'
        });
    }

    const validCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid category selected'
        });
    }

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a date'
        });
    }

    next();
};

/**
 * POST /api/expenses
 * Add a new expense
 */
router.post('/', validateExpense, async (req, res) => {
    try {
        const { title, amount, category, date, notes } = req.body;

        const expense = new Expense({
            title: title.trim(),
            amount: parseFloat(amount),
            category,
            date: new Date(date),
            notes: notes ? notes.trim() : ''
        });

        const savedExpense = await expense.save();

        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            data: savedExpense
        });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add expense',
            error: error.message
        });
    }
});

/**
 * GET /api/expenses
 * Get all expenses with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const {
            category,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            sortBy = 'date',
            sortOrder = 'desc',
            search
        } = req.query;

        // Build the query object
        let query = {};

        // Filter by category
        if (category && category !== 'All') {
            query.category = category;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        // Filter by amount range
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) {
                query.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                query.amount.$lte = parseFloat(maxAmount);
            }
        }

        // Search by title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Determine sort order
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with sorting
        const expenses = await Expense.find(query).sort(sortObj);

        // Get total count
        const totalCount = await Expense.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Expenses fetched successfully',
            data: expenses,
            total: totalCount
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses',
            error: error.message
        });
    }
});

/**
 * GET /api/expenses/summary
 * Get expense summary for dashboard
 */
router.get('/summary', async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Total expenses
        const totalExpenses = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Today's expenses
        const todayExpenses = await Expense.aggregate([
            {
                $match: {
                    date: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // This month's expenses
        const monthExpenses = await Expense.aggregate([
            {
                $match: {
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Total number of transactions
        const totalTransactions = await Expense.countDocuments();

        // Expenses by category
        const expensesByCategory = await Expense.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Monthly spending trends (last 6 months)
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const monthlyTrends = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Summary fetched successfully',
            data: {
                totalExpenses: totalExpenses[0]?.total || 0,
                todayExpenses: todayExpenses[0]?.total || 0,
                monthExpenses: monthExpenses[0]?.total || 0,
                totalTransactions,
                expensesByCategory,
                monthlyTrends
            }
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        });
    }
});

/**
 * GET /api/expenses/:id
 * Get a single expense by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense fetched successfully',
            data: expense
        });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense',
            error: error.message
        });
    }
});

/**
 * PUT /api/expenses/:id
 * Update an existing expense
 */
router.put('/:id', validateExpense, async (req, res) => {
    try {
        const { title, amount, category, date, notes } = req.body;

        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Update fields
        expense.title = title.trim();
        expense.amount = parseFloat(amount);
        expense.category = category;
        expense.date = new Date(date);
        expense.notes = notes ? notes.trim() : '';

        const updatedExpense = await expense.save();

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: updatedExpense
        });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense
 */
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
            data: expense
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
});

module.exports = router;
