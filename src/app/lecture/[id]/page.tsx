"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useParams } from "next/navigation";
import Nav from "@/components/navbar/page";
import CopyRight from "@/components/copybar/page";
import Loader from "@/components/loader/page";
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FaWandMagicSparkles } from "react-icons/fa6";



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
              <div className="ml-4 mt-2">
                <Label>Lecture Transcript</Label>
              </div>
              <div className="ml-4 mr-4 bg-[#E6E6E6] dark:bg-[#0E0E0E] rounded-xl">
                <Textarea className="h-28 text-black dark:text-white" placeholder="Paste your transcript here." />
              </div>
              <div className="ml-4 mr-4 mt-4 flex item-center justify-center">
                <Button className="w-[25%] text-lg"> <FaWandMagicSparkles className="mr-2 h-6 w-6" />  Generate </Button>
              </div>
              <div className="h-72 rounded-xl bg-[#E6E6E6] dark:bg-[#0E0E0E] mt-4 ml-4 mr-4 flex justify-between items-center gap-x-4 p-4">
                {/* Box 1 */}
                <div className="w-1/4 h-full bg-[#FFFFFF] dark:bg-[#212628] rounded-lg flex justify-center items-center text-white">
                  Box 1
                </div>
                {/* Box 2 */}
                <div className="w-1/4 h-full  bg-[#FFFFFF] dark:bg-[#212628] rounded-lg flex justify-center items-center text-white">
                  Box 2
                </div>
                {/* Box 3 */}
                <div className="w-1/4 h-full  bg-[#FFFFFF] dark:bg-[#212628] rounded-lg flex justify-center items-center text-white">
                  Box 3
                </div>
                {/* Box 4 */}
                <div className="w-1/4 h-full  bg-[#FFFFFF] dark:bg-[#212628] rounded-lg flex justify-center items-center text-white">
                  Box 4
                </div>
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
