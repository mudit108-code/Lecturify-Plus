import { connect } from "@/dbConfig/dbConfig"; // Database connection
import User from "@/models/userModel"; // User model
import { NextRequest, NextResponse } from "next/server"; // Next.js API response types
import { getDataFromToken } from "@/helpers/getDataFromToken"; // Helper to extract user data from token

// Define the Lecture type
interface Lecture {
  _id: string; // MongoDB ObjectId as string
  topic: string;
}

// Establish database connection
connect();

// Define the DELETE request handler to delete a lecture
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request); // Get user's _id from token

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Find the user by userId (_id)
    const user = await User.findById(userId); // Use _id to query the user
    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    const userEmail = user.email; // Access the user's email from the found user object

    // Extract the lectureId from the request body
    const { lectureId } = await request.json();

    // Ensure the lectureId is provided
    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID is required" }, { status: 400 });
    }

    // Ensure the `lectures` field is initialized as an array
    if (!Array.isArray(user.lectures)) {
      user.lectures = []; // Initialize as an empty array if not already an array
    }

    // Find the lecture to delete by lectureId
    const lectureIndex = user.lectures.findIndex((lecture: Lecture) => lecture._id.toString() === lectureId);
    if (lectureIndex === -1) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    // Remove the lecture from the user's lectures array
    user.lectures.splice(lectureIndex, 1);

    // Save the updated user data in the database
    await user.save();

    return NextResponse.json({
      message: "Lecture deleted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Error:", error); // Log any errors for debugging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
