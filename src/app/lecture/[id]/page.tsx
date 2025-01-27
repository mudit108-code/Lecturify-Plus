"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useParams } from "next/navigation";
import Nav from "@/components/navbar/page";
import CopyRight from "@/components/copybar/page";
import Loader from "@/components/loader/page";

const LecturePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userRole, setUserRole] = useState("");
  const { id } = useParams(); // Get the lecture ID from the URL
  const [lectureDetails, setLectureDetails] = useState<any>(null);

  // Format lecture time to DD/MM/YY and 24-hour format
  const formatLectureTime = (isoString: string) => {
    const date = new Date(isoString);
    const formattedDate = date.toLocaleDateString("en-IN"); // Format as DD/MM/YYYY
    const formattedTime = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });
    return `${formattedDate} ${formattedTime}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/users/me");
        const { data } = response.data;
        setUserDetails(data);
        setUserRole(data.role);
        setLoading(false);
        const lecture = data.lectures.find(
          (lecture: any) => lecture._id.toString() === id
        );

        if (lecture) {
          setLectureDetails({
            lectureId: lecture._id,
            lectureName: lecture.topic,
            LectureTime: formatLectureTime(lecture.createdAt),
          });
        } else {
          console.error("Lecture not found");
        }
      } catch (error) {
        expirylogout();
        router.push("/login");
      }
    };
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchUserData();
    }
  }, [router, id]);

  const expirylogout = async () => {
    try {
      await axios.get("/api/users/logout");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!lectureDetails) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="h-[100vh] pt-24">
        <Nav loading={loading} userRole={userRole} userDetails={userDetails} />
        <div className="h-[90%] dark:bg-[#212628] rounded-3xl ml-8 bg-white mr-8">
          <div>
            <div className="text-xl font-bold">
              <div className="pl-4 pt-4">
                <h1 className="italic text-3xl">
                  {lectureDetails.lectureName} {" "}
                  <span className="text-base lowercase">
                    {lectureDetails.LectureTime}
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>
        <CopyRight />
      </div>
    </div>
  );
};

export default LecturePage;
