"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useParams } from "next/navigation";

const LecturePage = () => {
  const router = useRouter();
  const { id } = useParams(); // Get the lecture ID from the URL
  const [lectureDetails, setLectureDetails] = useState<any>(null);

  useEffect(() => {
    if (id) {
      // Fetch logged-in user's data
      const fetchUserData = async () => {
        try {
          // Make API call to get the logged-in user data
          const userResponse = await axios.get("/api/users/me");
          const user = userResponse.data.data;

          // Search for the lecture with the given ID in the user's lectures array
          const lecture = user.lectures.find((lecture: any) => lecture._id.toString() === id);

          if (lecture) {
            setLectureDetails({
              lectureId: lecture._id,
              lectureName: lecture.topic,
            });
          } else {
            console.error("Lecture not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData(); // Fetch user data when the ID is available
    }
  }, [id]);

  if (!lectureDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl font-bold">
        <h1>Lecture ID: {lectureDetails.lectureId}</h1>
        <h2>Lecture Name: {lectureDetails.lectureName}</h2>
      </div>
    </div>
  );
};

export default LecturePage;
