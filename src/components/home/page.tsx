import React from 'react';
import CopyRight from '../copybar/page';
import { Button } from '../ui/button';
import { FaPlus } from "react-icons/fa6";
const Home = () => {
    return (
        <div className="h-[100vh] pt-24">
            <div className="h-[90%] dark:bg-[#212628] rounded-3xl ml-8 bg-white mr-8">
                <div className="flex space-x-4 pl-4 pt-4">
                    <div className="w-[99%] h-48 bg-[#E6E6E6] dark:bg-[#0F0F0F] rounded-3xl flex flex-col justify-center items-center text-center space-y-4">
                        {/* Title */}
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

                        {/* Description */}
                        <div className="text-4xl  text-gray-700 dark:text-gray-300">
                            Lecture to Notes/Quiz Generator
                        </div>

                        {/* Button */}
                        <div>
                            <Button className='rounded-3xl '><FaPlus className='mr-2'/> New Lecture</Button>
                        </div>
                    </div>
                </div>
            </div>
            <CopyRight />
        </div>
    );
};

export default Home;
