import { connect } from "@/dbConfig/dbConfig"; // Database connection
import User from "@/models/userModel"; // User model
import { NextRequest, NextResponse } from "next/server"; // Next.js API response types
import { getDataFromToken } from "@/helpers/getDataFromToken"; // Helper to extract user data from token

// Establish database connection
connect();

// Define POST request handler to add a lecture
export async function POST(request: NextRequest) {
    try {
        // Extract userId (or email) from the token
        const userId = await getDataFromToken(request); // Get userId from the token
        console.log("Logged in userId:", userId); // Log userId to debug

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Extract the topic from the request body
        const { topic } = await request.json();

        // Ensure topic is provided
        if (!topic) {
            return NextResponse.json({ error: "Lecture topic is required" }, { status: 400 });
        }

        // Find the user by userId (use _id to ensure you're querying correctly in MongoDB)
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        // Log user data for debugging
        console.log("User found:", user);

        // Ensure the `lectures` field is initialized as an array
        if (!Array.isArray(user.lectures)) {
            user.lectures = []; // Initialize as an empty array if not already an array
        }

        // Log the current state of lectures before adding the new topic
        console.log("Current lectures before adding:", user.lectures);

        // Add the new lecture topic to the user's lectures array
        user.lectures.push({ topic });

        // Log the updated lectures array
        console.log("Updated lectures after adding:", user.lectures);

        // Save the updated user data in the database
        const updatedUser = await user.save();

        // Log the result of save operation
        console.log("Updated user saved:", updatedUser);

        return NextResponse.json({
            message: "Lecture added successfully",
            success: true,
        });
    } catch (error: any) {
        console.error("Error:", error); // Log any errors for debugging
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
