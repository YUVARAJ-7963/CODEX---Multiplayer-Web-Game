import React, { useEffect, useState, useCallback } from "react";
import {motion} from "framer-motion";
import Cimage from "../home-images/C_programming.png";
import Cpp from "../home-images/cpp.png"
import Java from "../home-images/java.png"
import Python from "../home-images/python.png"
import Kotlin from "../home-images/kotlin.png"
import Js from "../home-images/js.png"
import Php from "../home-images/php.png"
import Csharp from "../home-images/csharp.png"



const HorizontalScroll = () => {
  const [scrollY, setScrollY] = useState(0);

  // Memoize scroll handler for better performance
  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => {
      setScrollY(window.scrollY);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Optimize getScrollOffset for better performance
  const getScrollOffset = (base, startOffset, endOffset) => {
    if (scrollY < startOffset) return base;
    if (scrollY > endOffset) return 0;
    
    const progress = (scrollY - startOffset) / (endOffset - startOffset);
    // Use linear interpolation for smoother animation
    return base * (1 - progress);
  };

  // Common styles for language images
  const imageStyles = {
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))',
  };

  return (
    <div className="h-full">
      {/* Section 1 */}
      <section
        className="h-screen snap-start snap-always relative"
        style={{ viewTimelineName: "--section-1" }}
      >
        <div
          className="h-full w-full star bg-black text-white flex items-center justify-center text-4xl font-bold animate-horizontal-scroll"
          style={{ animationTimeline: "--section-1" }}
        >
          <div className="flex justify-center items-center h-full bg-transparent relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute h-max w-max left-[20%] top-[30%] md:left-80 md:top-80"
            >
              <img
                src={Cimage}
                alt="C Programming"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] hover:transform hover:scale-110"
              />
            </motion.div>

            <div className="absolute left-0 top-60 card p-5 overflow-hidden ">
              {" "}
              Languages
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute left-2/3 bottom-80"
            >
              <img
                src={Cpp}
                alt="C++ Programming"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] hover:transform hover:scale-110"
              ></img>{" "}
            </motion.div>
            <svg
              className="w-full h-full"
              viewBox="15 0 1125 500"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradientStroke1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF1493">
                    <animate
                      attributeName="stop-color"
                      values="#FF1493; #FF00FF; #FF69B4; #FF1493"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="25%" stopColor="#8A2BE2">
                    <animate
                      attributeName="stop-color"
                      values="#8A2BE2; #9400D3; #800080; #8A2BE2"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="75%" stopColor="#4B0082">
                    <animate
                      attributeName="stop-color"
                      values="#4B0082; #9370DB; #BA55D3; #4B0082"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#00FFFF">
                    <animate
                      attributeName="stop-color"
                      values="#00FFFF; #40E0D0; #48D1CC; #00FFFF"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>

              <path
                d="M0,250 Q280,50 500,250 T1180,252"
                fill="none"
                stroke="url(#gradientStroke1)"
                strokeWidth="84"
                strokeDasharray="1700"
                strokeDashoffset={getScrollOffset(1700, 0, 1000)}
                className="transition-[stroke-dashoffset] duration-700 ease-linear will-change-[stroke-dashoffset]"
                style={{ transform: 'translateZ(0)' }}
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section
        className="h-screen snap-start snap-always relative border-none"
        style={{ viewTimelineName: "--section-2" }}
      >
        <div
          className="h-full w-full star bg-black text-white flex items-center justify-center text-4xl font-bold animate-horizontal-scroll"
          style={{ animationTimeline: "--section-2" }}
        >
          <div className="flex justify-center items-center h-full bg-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute left-1/3 top-80 "
            >
              <img
                src={Java}
                alt="Java Programming"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] hover:transform hover:scale-110"
              ></img>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute left-2/3 bottom-80"
            >
              <img
                src={Python}
                alt="Python Programming"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] hover:transform hover:scale-110"
              ></img>
            </motion.div>

            <svg
              className="w-full h-full"
              viewBox="20 0 1100 500"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradientStroke2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00FFFF">
                    <animate
                      attributeName="stop-color"
                      values="#00FFFF; #40E0D0; #48D1CC; #00FFFF"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="33%" stopColor="#4169E1">
                    <animate
                      attributeName="stop-color"
                      values="#4169E1; #1E90FF; #87CEEB; #4169E1"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="66%" stopColor="#9400D3">
                    <animate
                      attributeName="stop-color"
                      values="#9400D3; #8A2BE2; #9370DB; #9400D3"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#FF1493">
                    <animate
                      attributeName="stop-color"
                      values="#FF1493; #FF69B4; #FF00FF; #FF1493"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>
              <path
                d="M0,278 Q550,0 650,250 T1150,233"
                fill="none"
                stroke="url(#gradientStroke2)"
                strokeWidth="80"
                strokeDasharray="1700"
                strokeDashoffset={getScrollOffset(1700, 800, 1650)}
                className="transition-[stroke-dashoffset] duration-700 ease-linear will-change-[stroke-dashoffset]"
                style={{ transform: 'translateZ(0)' }}
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section
        className="h-screen snap-start snap-always relative"
        style={{ viewTimelineName: "--section-3" }}
      >
        <div
          className="h-full w-full bg-black star text-white flex items-center justify-center text-4xl font-bold animate-horizontal-scroll"
          style={{ animationTimeline: "--section-3" }}
        >
          <div className="flex justify-center items-center h-full bg-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute left-72  top-72"
            >
              {" "}
              <img
                src={Kotlin}
                alt="Kotlin Programming"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] hover:transform hover:scale-110"
              ></img>{" "}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute right-96 bottom-1/3"
            >
              {" "}
              <img
                src={Js}
                alt="Java Script"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[220px] md:h-[220px] hover:transform hover:scale-110"
              ></img>{" "}
            </motion.div>
            <svg
              className="w-full h-full"
              viewBox="35 0 1100 500"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradientStroke3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF1493">
                    <animate
                      attributeName="stop-color"
                      values="#FF1493; #FF00FF; #FF69B4; #FF1493"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="33%" stopColor="#9400D3">
                    <animate
                      attributeName="stop-color"
                      values="#9400D3; #8A2BE2; #800080; #9400D3"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="66%" stopColor="#4169E1">
                    <animate
                      attributeName="stop-color"
                      values="#4169E1; #1E90FF; #00BFFF; #4169E1"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#00FFFF">
                    <animate
                      attributeName="stop-color"
                      values="#00FFFF; #40E0D0; #48D1CC; #00FFFF"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>
              <path
                d="M0,283 Q300,0 500,250 T1180,237"
                fill="none"
                stroke="url(#gradientStroke3)"
                strokeWidth="73"
                strokeDasharray="1700"
                strokeDashoffset={getScrollOffset(1700, 1600, 2375)}
                className="transition-[stroke-dashoffset] duration-700 ease-linear will-change-[stroke-dashoffset]"
                style={{ transform: 'translateZ(0)' }}
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section
        className="h-screen snap-start snap-always relative"
        style={{ viewTimelineName: "--section-4" }}
      >
        <div
          className="h-full w-full bg-black star text-white flex items-center justify-center text-4xl font-bold animate-horizontal-scroll"
          style={{ animationTimeline: "--section-4" }}
        >
          <div className="flex justify-center items-center h-full bg-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute left-80 top-80"
            >
              {" "}
              <img
                src={Csharp}
                alt="c# Programming"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] hover:transform hover:scale-110"
              ></img>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="absolute right-96 bottom-96"
            >
              {" "}
              <img
                src={Php}
                alt="PHP Programming"
                style={imageStyles}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] hover:transform hover:scale-110"
              ></img>{" "}
            </motion.div>
            <svg
              className="w-full h-full"
              viewBox="35 0 1500 500"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradientStroke4" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00FFFF">
                    <animate
                      attributeName="stop-color"
                      values="#00FFFF; #40E0D0; #48D1CC; #00FFFF"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="25%" stopColor="#4169E1">
                    <animate
                      attributeName="stop-color"
                      values="#4169E1; #1E90FF; #00BFFF; #4169E1"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="50%" stopColor="#9400D3">
                    <animate
                      attributeName="stop-color"
                      values="#9400D3; #8A2BE2; #800080; #9400D3"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="75%" stopColor="#FF1493">
                    <animate
                      attributeName="stop-color"
                      values="#FF1493; #FF00FF; #FF69B4; #FF1493"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#00FFFF">
                    <animate
                      attributeName="stop-color"
                      values="#00FFFF; #40E0D0; #48D1CC; #00FFFF"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>
              <path
                d="M0,283 Q400,0 1100,350 T1800,0"
                fill="none"
                stroke="url(#gradientStroke4)"
                strokeWidth="70"
                strokeDasharray="1700"
                strokeDashoffset={getScrollOffset(1700, 2400, 2925)}
                className="transition-[stroke-dashoffset] duration-700 ease-linear will-change-[stroke-dashoffset]"
                style={{ transform: 'translateZ(0)' }}
              />
            </svg>
          </div>
        </div>
      </section>
      <section className="h-[60vh]"></section>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes horizontal-scroll {
          0% {
            transform: translateX(100%);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-horizontal-scroll {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          animation: horizontal-scroll ease-in-out both;
        }

        /* Enhanced space background with multiple star layers */
        .star {
          background: radial-gradient(ellipse at center, #0a0a2a 0%, #000 100%);
          overflow: hidden;
          transform: translateZ(0);
        }

        /* Main star layer with increased density */
        .star::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 5% 5%, rgba(255, 255, 255, 0.95), transparent),
            radial-gradient(1px 1px at 15% 15%, rgba(255, 255, 255, 0.85), transparent),
            radial-gradient(1.2px 1.2px at 25% 25%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1.5px 1.5px at 35% 35%, rgba(255, 255, 255, 0.85), transparent),
            radial-gradient(1px 1px at 45% 45%, rgba(255, 255, 255, 0.95), transparent),
            radial-gradient(1.3px 1.3px at 55% 55%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1.4px 1.4px at 65% 65%, rgba(255, 255, 255, 0.85), transparent),
            radial-gradient(1.2px 1.2px at 75% 75%, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1px 1px at 85% 85%, rgba(255, 255, 255, 0.95), transparent),
            radial-gradient(1.5px 1.5px at 95% 95%, rgba(255, 255, 255, 0.85), transparent);
          background-size: 450px 450px, 550px 550px, 600px 600px, 750px 750px, 800px 800px;
          background-repeat: repeat;
          opacity: 0.7;
          animation: twinkle 12s ease-in-out infinite;
          will-change: opacity;
        }

        /* Additional distant star layer */
        .star > div::before {
          content: '';
          position: fixed;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(0.5px 0.5px at 10% 10%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(0.5px 0.5px at 20% 30%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(0.7px 0.7px at 30% 40%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(0.5px 0.5px at 40% 50%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(0.6px 0.6px at 50% 60%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(0.5px 0.5px at 60% 70%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(0.7px 0.7px at 70% 80%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(0.5px 0.5px at 80% 90%, rgba(255, 255, 255, 0.7), transparent);
          background-size: 300px 300px, 350px 350px, 400px 400px, 450px 450px;
          background-repeat: repeat;
          opacity: 0.5;
          animation: twinkle-slow 15s ease-in-out infinite;
          pointer-events: none;
        }

        /* Enhanced twinkling animations */
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          25% { opacity: 0.7; }
          50% { opacity: 0.9; }
          75% { opacity: 0.7; }
        }

        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        /* Enhanced section variations */
        section:nth-child(1) .star {
          background: radial-gradient(ellipse at center, #0a0a2a 0%, #000 100%),
                      linear-gradient(45deg, rgba(128, 0, 128, 0.1), transparent 60%);
        }

        section:nth-child(2) .star {
          background: radial-gradient(ellipse at center, #0a0a2a 0%, #000 100%),
                      linear-gradient(-45deg, rgba(0, 0, 128, 0.1), transparent 60%);
        }

        section:nth-child(3) .star {
          background: radial-gradient(ellipse at center, #0a0a2a 0%, #000 100%),
                      linear-gradient(135deg, rgba(0, 128, 128, 0.1), transparent 60%);
        }

        section:nth-child(4) .star {
          background: radial-gradient(ellipse at center, #0a0a2a 0%, #000 100%),
                      linear-gradient(-135deg, rgba(128, 0, 64, 0.1), transparent 60%);
        }

        /* Color tint variations for sections */
        section:nth-child(1) .star::after {
          background: 
            radial-gradient(circle at 30% 40%, rgba(128, 0, 128, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 70% 60%, rgba(64, 0, 128, 0.1) 0%, transparent 50%);
        }

        section:nth-child(2) .star::after {
          background: 
            radial-gradient(circle at 60% 30%, rgba(0, 0, 128, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 40% 70%, rgba(0, 64, 128, 0.1) 0%, transparent 50%);
        }

        section:nth-child(3) .star::after {
          background: 
            radial-gradient(circle at 40% 60%, rgba(0, 128, 128, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 70% 30%, rgba(0, 128, 64, 0.1) 0%, transparent 50%);
        }

        section:nth-child(4) .star::after {
          background: 
            radial-gradient(circle at 70% 20%, rgba(128, 0, 64, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 30% 80%, rgba(128, 32, 0, 0.1) 0%, transparent 50%);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .star::before,
          .star > div::before {
            background-size: 350px 350px;
            animation: none;
          }
          
          .star::after {
            opacity: 0.3;
          }
        }

        /* Add hover effects for images */
        img {
          transition: transform 0.3s ease-out;
        }
        
        img:hover {
          transform: scale(1.1);
        }

        /* Add responsive styles */
        @media (max-width: 768px) {
          .animate-horizontal-scroll {
            animation-duration: 20s;
          }
        }

        html {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          height: 100%;
        }

        body {
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default HorizontalScroll;