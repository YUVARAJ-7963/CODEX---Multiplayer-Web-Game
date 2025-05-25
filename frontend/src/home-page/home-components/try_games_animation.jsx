      import React from "react";
    import { motion } from "framer-motion";
    import Card from "./game_cards.jsx";
    import Image1 from "../home-images/s_w_con.png"
    import Image2 from "../home-images/error.png"
    import Image3 from "../home-images/quiz.png"

    import Footer from "./footer.jsx";

    // Separate GameSection component for each game section
    const GameSection = ({ initialBg, targetBg, heading, description, imageUrl, height = "h-screen" }) => {
      return (
        <motion.div 
          initial={{ background: initialBg }}
          whileInView={{ background: targetBg }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className={`sticky top-0 ${height} flex flex-col items-center justify-center text-white snap-start`}
        >
          <Card 
            heading={heading}
            description={description}
            imageUrl={imageUrl}
          />
        </motion.div>
      );
    };

    // Main Trygames component
    const Trygames = () => {
      return (
        <div className="relative">
          <LampContainer />
          
          <GameSection 
            initialBg="linear-gradient(to bottom, #020617, #1e1b4b)"
            targetBg="linear-gradient(to bottom, #1e1b4b, #4c1d95)"
            heading="Debugging"
            description="Practice finding and fixing common programming errors"
            imageUrl={Image2}
          />
          
          <GameSection 
            initialBg="linear-gradient(to bottom, #4c1d95, #6b21a8)"
            targetBg="linear-gradient(to bottom, #6b21a8, #86198f)"
            heading=" Flash Code"
            description="Test your programming knowledge with interactive quizzes"
            imageUrl={Image3}
          />
          
          <motion.div 
            initial={{ background: "linear-gradient(to bottom, #18181b, #27272a)" }}
            whileInView={{ background: "linear-gradient(to bottom, #e2e8f0, #f8fafc)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="sticky top-0 h-[50vh] flex flex-col items-center justify-center text-black snap-start"
          >
            <Footer />
          </motion.div>
        </div>
      );
    };

    export default Trygames;

    const LampContainer = () => {
      // Reduced number of particles and simplified animations
      const particles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        initialX: Math.random() * 80 - 40,
        initialY: Math.random() * 80 - 40,
      }));

      return (
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center bg-[#020617] text-white snap-start overflow-hidden">
          {/* Reduced number of particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: particle.initialX, y: particle.initialY }}
              animate={{ 
                y: [particle.initialY, particle.initialY - 15, particle.initialY],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-cyan-300 rounded-full"
            />
          ))}

          {/* Simplified glow effect */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "70vw" }}
            transition={{ duration: 1 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 h-2 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 rounded-full shadow-[0_10px_30px_10px_rgba(0,255,255,0.5)]"
          />
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-16 bg-gradient-to-br font-extrabold z-50 from-violet-400 via-purple-400 to-rose-400 py-4 bg-clip-text text-center text-5xl tracking-tight text-transparent md:text-7xl"
          >
            Try Games
          </motion.h1>
          
          {/* Card container with simplified animation */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-32 relative"
          >
            <Card 
              heading="Software Contest"
              description="Compete in coding challenges and improve your skills"
              imageUrl={Image1}
            />
          </motion.div>
        </div>
      );
    };
