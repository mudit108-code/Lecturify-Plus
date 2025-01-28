import { connect } from "@/dbConfig/dbConfig"; // Database connection
import User from "@/models/userModel"; // User model
import { NextRequest, NextResponse } from "next/server"; // Next.js API response types
import { getDataFromToken } from "@/helpers/getDataFromToken"; // Helper to extract user data from token

// Establish database connection
connect();

// Define the type for a lecture
interface Lecture {
  topic: string;
  transcript: string | null;
  createdAt: Date;
}

// Define POST request handler to save the transcript
export async function POST(request: NextRequest) {
  try {
    // Extract userId (or email) from the token
    const userId = await getDataFromToken(request); // Get userId from the token
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Extract topic and transcript from the request body
    const { topic, transcript } = await request.json();

    // Ensure topic and transcript are provided
    if (!topic || !transcript) {
      return NextResponse.json({ error: "Topic and transcript are required" }, { status: 400 });
    }

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    // Check if the topic exists in the user's lectures
    const lecture: Lecture | undefined = user.lectures.find(
      (lec: Lecture) => lec.topic === topic
    );
    
    if (!lecture) {
      return NextResponse.json({ error: "Lecture topic not found" }, { status: 404 });
    }

    // Update the transcript for the found lecture
    lecture.transcript = transcript;

    // Save the updated user data in the database
    await user.save();

    return NextResponse.json({
      message: "Transcript saved successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Error:", error); // Log any errors for debugging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
