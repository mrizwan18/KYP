// server.js

// Import required packages
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config(); // To load environment variables from a .env file

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3001; // Use port from environment or default to 3001

// --- Environment Variable Validation ---
// Ensure that the necessary environment variables are set.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_KEY must be set in the .env file.");
  process.exit(1); // Exit the process with an error code
}

// --- Supabase Client Initialization ---
// Create a single, reusable Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing) for all routes.
// This allows your frontend (on a different domain) to make requests to this API.
app.use(cors());

// Enable Express to parse JSON request bodies.
app.use(express.json());

// --- API Routes ---

/**
 * @route   GET /api/products
 * @desc    Get all products, filterable by gender_target
 * @access  Public
 * * This is the main endpoint for the frontend to fetch product data.
 * It accepts a query parameter `gender_target` to filter products
 * for either 'wife' or 'husband' game modes.
 */
app.get('/api/products', async (req, res) => {
  const { gender_target } = req.query;

  // Validate the gender_target query parameter
  if (!gender_target || (gender_target !== 'wife' && gender_target !== 'husband')) {
    return res.status(400).json({ 
      error: "Invalid or missing 'gender_target' query parameter. Must be 'wife' or 'husband'." 
    });
  }

  try {
    // Build the query to Supabase
    const { data, error } = await supabase
      .from('products') // The name of your table in Supabase
      .select('*') // Select all columns
      .eq('gender_target', gender_target); // Filter where gender_target matches the query

    // Handle any errors from the Supabase query
    if (error) {
      // Throwing the error will send it to the catch block
      throw error;
    }

    // Send the fetched data back to the client with a 200 OK status
    res.status(200).json(data);

  } catch (error) {
    // Log the error for debugging purposes on the server
    console.error('Error fetching products from Supabase:', error.message);

    // Send a generic 500 Internal Server Error response to the client
    res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
});

/**
 * @route   GET /
 * @desc    Root health check endpoint
 * @access  Public
 * * A simple endpoint to confirm that the server is running.
 */
app.get('/', (req, res) => {
    res.status(200).send('KYP Backend API is running!');
});


// --- Server Initialization ---
// Start the Express server and listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
