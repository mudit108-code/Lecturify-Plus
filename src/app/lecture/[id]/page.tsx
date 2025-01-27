"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useParams } from "next/navigation";
import Nav from "@/components/navbar/page";
import CopyRight from "@/components/copybar/page";
import Loader from "@/components/loader/page";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaMicrophoneAlt } from "react-icons/fa";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const LecturePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userRole, setUserRole] = useState("");
  const { id } = useParams(); // Get the lecture ID from the URL
  const [lectureDetails, setLectureDetails] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0); // Time in seconds
  const [transcript, setTranscript] = useState(""); // Store the final live transcript
  const [recognition, setRecognition] = useState<any>(null);



  // Using useRef to persist the timer across renders
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        // Iterate through the results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript = event.results[i][0].transcript; // Store the last interim result
          }
        }

        // Only append final results once
        setTranscript((prevTranscript) => {
          if (finalTranscript.trim() && !prevTranscript.endsWith(finalTranscript.trim())) {
            return prevTranscript + " " + finalTranscript.trim();
          }
          return prevTranscript; // Avoid duplicate final text
        });
      };

      setRecognition(recognitionInstance);
    } else {
      console.error("Speech recognition is not supported in this browser.");
    }
  }, []);

  // Start timer when recording starts
  useEffect(() => {
    if (isRecording) {
      // Start the timer when recording begins
      timer.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1); // Increment time every second
      }, 1000);

      // Start Speech Recognition
      if (recognition) {
        recognition.start();
      }
    } else {
      // Stop the timer when recording is stopped
      if (timer.current) {
        clearInterval(timer.current);
      }
      setTime(0); // Reset the timer when the recording ends

      // Stop Speech Recognition
      if (recognition) {
        recognition.stop();
      }
    }

    // Cleanup the timer on component unmount or isRecording change
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [isRecording, recognition]);

  // Format the time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleRecordClick = () => {
    setIsRecording(true); // Start recording
    setTime(0); // Reset the timer
  };

  const handleEndRecording = () => {
    setIsRecording(false); // Stop recording
  };

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

              <div
                className={`h-16 flex justify-center mt-4 dark:bg-[#0E0E0E] bg-[#E6E6E6] rounded-xl ml-4 mr-4`}
              >
                <Button
                  className={`h-12 hover:bg-white bg-white mt-2 flex items-center justify-between gap-2 transition-all duration-500 ease-in-out ${isRecording ? "w-[98%] rounded-xl" : "w-80 rounded-[100px]"} `}
                  onClick={isRecording ? handleEndRecording : handleRecordClick}
                >
                  {/* Left Side: Mic Icon and Timer */}
                  <div
                    className={`flex items-center justify-start h-12 transition-all duration-500 ease-in-out ${isRecording ? "ml-0" : "ml-4"}`}
                  >
                    <FaMicrophoneAlt className="h-8 w-8 text-black" />
                    {/* Timer (moves with mic icon to the left when recording starts) */}
                    {isRecording && (
                      <div className="text-lg text-black font-semibold ml-4">
                        <span>{formatTime(time)}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle: Audio Wave Animation (Visible when recording) */}
                  {isRecording && (
                    <div className="boxvisionContainer flex justify-center items-center">
                      <div className="boxvision boxvision1"></div>
                      <div className="boxvision boxvision2"></div>
                      <div className="boxvision boxvision3"></div>
                      <div className="boxvision boxvision4"></div>
                      <div className="boxvision boxvision5"></div>
                      <div className="boxvision boxvision6"></div>
                      <div className="boxvision boxvision7"></div>
                      <div className="boxvision boxvision8"></div>
                      <div className="boxvision boxvision9"></div>
                      <div className="boxvision boxvision10"></div>
                      <div className="boxvision boxvision11"></div>
                      <div className="boxvision boxvision12"></div>
                      <div className="boxvision boxvision13"></div>
                      <div className="boxvision boxvision14"></div>
                      <div className="boxvision boxvision15"></div>
                      <div className="boxvision boxvision16"></div>
                      <div className="boxvision boxvision17"></div>
                      <div className="boxvision boxvision18"></div>
                      <div className="boxvision boxvision19"></div>
                      <div className="boxvision boxvision20"></div>
                      <div className="boxvision boxvision21"></div>
                      <div className="boxvision boxvision22"></div>
                      <div className="boxvision boxvision23"></div>
                      <div className="boxvision boxvision24"></div>
                      <div className="boxvision boxvision25"></div>
                      <div className="boxvision boxvision26"></div>
                      <div className="boxvision boxvision27"></div>
                      <div className="boxvision boxvision28"></div>
                      <div className="boxvision boxvision29"></div>
                      <div className="boxvision boxvision30"></div>
                      <div className="boxvision boxvision31"></div>
                      <div className="boxvision boxvision32"></div>
                      <div className="boxvision boxvision33"></div>
                      <div className="boxvision boxvision34"></div>
                      <div className="boxvision boxvision35"></div>
                      <div className="boxvision boxvision36"></div>
                      <div className="boxvision boxvision37"></div>
                      <div className="boxvision boxvision38"></div>
                      <div className="boxvision boxvision39"></div>
                      <div className="boxvision boxvision40"></div>
                      <div className="boxvision boxvision41"></div>
                      <div className="boxvision boxvision42"></div>
                      <div className="boxvision boxvision43"></div>
                      <div className="boxvision boxvision44"></div>
                      <div className="boxvision boxvision45"></div>
                      <div className="boxvision boxvision46"></div>
                      <div className="boxvision boxvision47"></div>
                      <div className="boxvision boxvision48"></div>
                      <div className="boxvision boxvision49"></div>
                      <div className="boxvision boxvision50"></div>
                    </div>
                  )}

                  {/* Text (changes to 'Stop Recording' and moves to the extreme right when recording starts) */}
                  <span
                    className={`transition-all text-black duration-500 ease-in-out ${isRecording
                      ? "mr-0 bg-black text-white px-6 py-2 rounded-xl text-sm"
                      : "mr-4 text-xl"
                      }`}
                  >
                    {isRecording ? "Stop Recording" : "Click to Record Lecture"}
                  </span>
                </Button>
              </div>

              <div className="ml-4 mt-2 ">
                <Label className="text-lg">Lecture Transcript</Label>
              </div>
              <div className="relative ml-4 mr-4 bg-[#E6E6E6] dark:bg-[#0E0E0E] rounded-xl">
                <Textarea
                  className="h-36 text-black dark:text-white pr-20" // Added padding to the right for the button
                  placeholder="Paste your transcript here."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)} // Allow manual editing
                />
                <Button
                  className="absolute bottom-2 right-2 px-4 py-2 rounded-lg text-sm transition"
                  onClick={() => {
                    console.log("Transcript saved:", transcript); // Replace with your save logic
                    alert("Transcript saved!");
                  }}
                >
                  Save Transcript
                </Button>
              </div>

              <div className="ml-4 mr-4 mt-4 flex item-center justify-center">
                <Button className="w-[25%] text-lg">
                  <FaWandMagicSparkles className="mr-2 h-6 w-6" /> Generate
                </Button>
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
