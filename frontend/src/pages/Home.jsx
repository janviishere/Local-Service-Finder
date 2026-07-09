import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";

const quickTags = [
  "Electrician",
  "Plumber",
  "House Cleaning",
  "AC Repair",
  "Painter",
];

export default function Home() {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");

  const handleTagClick = (tag) => {
    setService(tag);
  };

  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 object-cover w-full h-full z-0"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-black/20 to-black/40" />

      {/* Hero Content */}
      <div
        className="relative z-20 flex flex-col items-center justify-end w-full px-4 pb-24 text-center"
        style={{ minHeight: "100vh" }}
      >
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="relative w-full max-w-3xl mx-auto"
        >
          {/* Premium Background Glow */}
          <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-r from-white/5 via-white/20 to-white/5 blur-3xl scale-110" />

          {/* Top Reflection */}
          <div className="absolute -top-5 left-20 right-20 h-10 rounded-full bg-white/20 blur-2xl -z-10" />

          {/* Glass Border */}
          <div className="rounded-[32px] border border-white/20 bg-white/5 backdrop-blur-xl p-2 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
            <div className="bg-white/95 backdrop-blur-3xl rounded-2xl md:rounded-full p-2 flex flex-col md:flex-row items-stretch gap-2 border border-white/30 shadow-2xl">
              {/* Service Input */}
              <div className="flex flex-1 items-center gap-3 px-5 py-3 border-b md:border-b-0 md:border-r border-slate-200">
                <Search
                  className="text-royal-blue shrink-0"
                  size={20}
                />

                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="What service do you need?"
                  className="w-full bg-transparent outline-none text-deep-navy placeholder:text-slate-400 font-medium text-sm"
                />
              </div>

              {/* Location Input */}
              <div className="flex flex-1 items-center gap-3 px-5 py-3">
                <MapPin
                  className="text-royal-blue shrink-0"
                  size={20}
                />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                  className="w-full bg-transparent outline-none text-deep-navy placeholder:text-slate-400 font-medium text-sm"
                />
              </div>

              {/* Button */}
              <button className="px-8 py-4 font-bold text-white transition-all duration-300 rounded-xl md:rounded-full bg-royal-blue hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/40 whitespace-nowrap">
                Find Service
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex flex-wrap justify-center gap-3 mt-7"
        >
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-5 py-2 text-sm font-medium text-white transition-all duration-300 border rounded-full cursor-pointer bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 hover:border-white/40 hover:scale-105"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}