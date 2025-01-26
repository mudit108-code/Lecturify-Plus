import { connect } from "@/dbConfig/dbConfig"; // Database connection
import User from "@/models/userModel"; // User model
import { NextRequest, NextResponse } from "next/server"; // Next.js API response types
import { getDataFromToken } from "@/helpers/getDataFromToken"; // Helper to extract user data from token

// Establish database connection
connect();

// Define the Lecture type
type Lecture = {
  _id: string;
  topic: string;
};

// Define PUT request handler to update a lecture
export async function PUT(request: NextRequest) {
    try {
        // Extract userId (or email) from the token
        const userId = await getDataFromToken(request); // Get userId from the token

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Extract lectureId and the new topic from the request body
        const { lectureId, newTopic } = await request.json();

        // Ensure both lectureId and newTopic are provided
        if (!lectureId || !newTopic) {
            return NextResponse.json({ error: "Lecture ID and new topic are required" }, { status: 400 });
        }

        // Find the user by userId (use _id to ensure you're querying correctly in MongoDB)
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        // Type the lectures field
        const lectures: Lecture[] = user.lectures;

        // Find the lecture to update by lectureId
        const lectureIndex = lectures.findIndex((lecture: Lecture) => lecture._id.toString() === lectureId);
        if (lectureIndex === -1) {
            return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
        }

        // Update the topic of the found lecture
        lectures[lectureIndex].topic = newTopic;

        // Save the updated user data in the database
        const updatedUser = await user.save();

        return NextResponse.json({
            message: "Lecture updated successfully",
            success: true,
            lecture: lectures[lectureIndex], // Returning the updated lecture
        });
    } catch (error: any) {
        console.error("Error:", error); // Log any errors for debugging
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
