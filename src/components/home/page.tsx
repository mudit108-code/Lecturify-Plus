"use client";

import React, { useEffect, useState } from "react";
import CopyRight from "../copybar/page";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Import toast library
import { FaPlus, FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { TfiWrite } from "react-icons/tfi";
import axios from "axios";

// Define Lecture type
type Lecture = {
    _id: string;
    topic: string;
    createdAt?: string;
};

const Home = () => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [lectures, setLectures] = useState<Lecture[]>([]); // Update lectures to use Lecture type
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newLecture, setNewLecture] = useState("");
    const [editingLecture, setEditingLecture] = useState<Lecture | null>(null); // For editing lecture
    const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const jwtToken = localStorage.getItem("token");
        setToken(jwtToken);

        // Fetch lectures when the component mounts
        if (jwtToken) {
            fetchLectures();
        }
    }, []);

    const fetchLectures = async () => {
        try {
            const response = await axios.get("/api/users/lectures", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setLectures(response.data.lectures || []);
        } catch (error) {
            console.error("Error fetching lectures:", error);
            toast.error("Failed to fetch lectures", {
                style: {
                    background: 'red',
                    color: 'white',
                },
            });
        }
    };

    const handleLoginRedirect = () => {
        router.push("/login");
    };

    const handleAddLecture = async () => {
        if (newLecture.trim() === "") {
            toast.error("Lecture topic cannot be empty", {
                style: {
                    background: 'red',
                    color: 'white',
                },
            });
            return;
        }

        try {
            const data = {
                topic: newLecture.trim(),
            };

            // Send request to add lecture
            const response = await axios.post("/api/users/lecture", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setNewLecture(""); // Clear input
            setDialogOpen(false); // Close dialog
            toast.success(response.data.message || "Lecture added successfully!", {
                style: {
                    background: 'green',
                    color: 'white',
                },
            });

            // Fetch updated lectures
            fetchLectures();
        } catch (error: any) {
            console.error("Error adding lecture:", error.response?.data);
            toast(error.response?.data?.error || "Failed to add lecture", {
                style: {
                    background: 'red',
                    color: 'white',
                },
            });
        }
    };

    const handleOpenLecture = (lectureId: string) => {
        router.push(`/lecture/${lectureId}`);  // Just pass the path
    };
    

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (editingLecture) {
                handleUpdateLecture(editingLecture._id);
            } else {
                handleAddLecture();
            }
        }
    };

    const handleEditLecture = (lecture: Lecture) => {
        setEditingLecture(lecture); // Set lecture to edit
        setNewLecture(lecture.topic); // Set input to current topic
        setDialogOpen(true); // Open dialog
    };

    const handleDeleteLecture = async (lectureId: string) => {
        try {
            const response = await axios.delete("/api/users/deletelecture", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    lectureId: lectureId, // Send the lectureId in the request body
                },
            });
    
            // Handle successful deletion
            setLectures(lectures.filter((lecture) => lecture._id !== lectureId)); // Update state
            toast.success("Lecture deleted successfully", {
                style: {
                    background: 'green',
                    color: 'white',
                },
            });
    
            // Close the delete confirmation dialog
            setDeleteDialogOpen(false);
    
        } catch (error) {
            toast.error("Failed to delete lecture", {
                style: {
                    background: 'red',
                    color: 'white',
                },
            });
        }
    };
    
      

    const handleDeleteConfirmation = (lecture: Lecture) => {
        setLectureToDelete(lecture); // Store the lecture to be deleted
        setDeleteDialogOpen(true); // Open delete confirmation dialog
    };

    const handleUpdateLecture = async (lectureId: string) => {
        if (newLecture.trim() === "") {
            toast.error("Lecture topic cannot be empty", {
                style: {
                    background: 'red',
                    color: 'white',
                },
            });
            return;
        }

        try {
            const data = {
                lectureId,    // Send the lectureId in the request body
                newTopic: newLecture.trim(),  // Send the new topic in the request body
            };

            const response = await axios.put(`/api/users/updatelecture`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` ,
                },
            });

            setNewLecture(""); // Clear input
            setDialogOpen(false); // Close dialog
            setEditingLecture(null); // Clear editing state
            toast.success(response.data.message || "Lecture updated successfully!", {
                style: {
                    background: 'green',
                    color: 'white',
                },
            });

            // Fetch updated lectures
            fetchLectures();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update lecture", {
                style: {
                    background: 'red',
                    color: 'white',
                },
            });
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="h-[100vh] pt-24">
            <div className="h-[90%] dark:bg-[#212628] rounded-3xl ml-8 bg-white mr-8">
                {/* Header Section */}
                <div className="flex space-x-4 pl-4 pt-4">
                    <div className="w-[99%] h-44 bg-[#E6E6E6] dark:bg-[#0F0F0F] rounded-3xl flex flex-col justify-center items-center text-center space-y-4">
                        <div
                            className="text-4xl font-bold italic tracking-tight"
                            style={{
                                background: "linear-gradient(to right, #5082EE, #D76572)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            Lecturify +
                        </div>
                        <div className="text-4xl text-gray-700 dark:text-gray-300">
                            Lecture to Notes/Quiz Generator
                        </div>
                        <div>
                            {token ? (
                                <Button className="rounded-3xl" onClick={() => setDialogOpen(true)}>
                                    <FaPlus className="mr-2" /> New Lecture
                                </Button>
                            ) : (
                                <Button className="rounded-3xl" onClick={handleLoginRedirect}>
                                    <FaPlus className="mr-2" /> Login To Convert
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
    
                {/* Table Section */}
                <div className="flex space-x-4 pl-4 pt-4">
                    <div className="w-[99%] h-[350px] bg-[#E6E6E6] dark:bg-[#0F0F0F] rounded-3xl p-4 overflow-y-auto">
                        <table className="table-auto w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border-b border-gray-700 w-8"></th>
                                    <th className="p-2 border-b border-gray-700">Lectures</th>
                                    <th className="p-2 border-b border-gray-700 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {lectures.map((lecture) => (
                                    <tr key={lecture._id} className="hover:bg-gray-200 dark:hover:bg-gray-900">
                                        <td className="p-2 border-b border-gray-700">
                                            <TfiWrite className="text-xl" />
                                        </td>
                                        <td className="p-2 border-b border-gray-700">{lecture.topic}</td>
                                        <td className="p-2 border-b border-gray-700 text-right flex justify-end space-x-2">
                                            <Button
                                                onClick={() => handleOpenLecture(lecture._id)}
                                                className="flex items-center px-6 mr-2 py-1 text-sm font-medium rounded-lg"
                                            >
                                                Open
                                            </Button>
                                            <button
                                                className="text-xl text-blue-500"
                                                onClick={() => handleEditLecture(lecture)}
                                            >
                                                <FaRegEdit className="mr-1" />
                                            </button>
                                            <button
                                                className="text-xl text-red-500"
                                                onClick={() => handleDeleteConfirmation(lecture)}
                                            >
                                                <FaTrashAlt className="mr-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {lectures.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            No lectures added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogTitle>Are you sure you want to delete this lecture?</DialogTitle>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => lectureToDelete && handleDeleteLecture(lectureToDelete._id)}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    
            {/* Dialog for Adding or Editing Lecture */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogTitle>{editingLecture ? "Edit Lecture" : "Add New Lecture"}</DialogTitle>
                    <div className="space-y-4">
                        <Input
                            placeholder="Enter lecture name"
                            value={newLecture}
                            onChange={(e) => setNewLecture(e.target.value)}
                            onKeyDown={handleKeyDown} // Attach the onKeyDown event
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (editingLecture) {
                                    // Handle update
                                    await handleUpdateLecture(editingLecture._id);
                                } else {
                                    handleAddLecture(); // Handle add
                                }
                            }}
                        >
                            {editingLecture ? "Update Lecture" : "Add Lecture"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    
            <CopyRight />
        </div>
    );
};

export default Home;