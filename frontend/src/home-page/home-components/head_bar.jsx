import React, { useState, useEffect } from 'react';
import Modal from "./login_modal";
import { useNavigate } from 'react-router-dom';

// Animation timing constants
const ANIMATION_TIMINGS = {
  SLIDE_DOWN: 100,
  EXPAND: 1100,
  SHOW_EXTRAS: 2300,
};

// SVG path constant
const LOGO_PATH = "M162.7 210c-1.8 3.3-25.2 44.4-70.1 123.5-4.9 8.3-10.8 12.5-17.7 12.5H9.8c-7.7 0-12.1-7.5-8.5-14.4l69-121.3c.2 0 .2-.1 0-.3l-43.9-75.6c-4.3-7.8 .3-14.1 8.5-14.1H100c7.3 0 13.3 4.1 18 12.2l44.7 77.5zM382.6 46.1l-144 253v.3L330.2 466c3.9 7.1 .2 14.1-8.5 14.1h-65.2c-7.6 0-13.6-4-18-12.2l-92.4-168.5c3.3-5.8 51.5-90.8 144.8-255.2 4.6-8.1 10.4-12.2 17.5-12.2h65.7c8 0 12.3 6.7 8.5 14.1z";

const Header = () => {
  const [isSlideDown, setIsSlideDown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);

    const resetStates = () => {
      setIsSlideDown(false);
      setIsExpanded(false);
      setShowExtras(false);
    };

    resetStates();

    const timers = [
      setTimeout(() => setIsSlideDown(true), ANIMATION_TIMINGS.SLIDE_DOWN),
      setTimeout(() => setIsExpanded(true), ANIMATION_TIMINGS.EXPAND),
      setTimeout(() => setShowExtras(true), ANIMATION_TIMINGS.SHOW_EXTRAS),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handlePlayClick = () => {
    navigate('/lobby');
  };

  const getHeaderClassName = () => `
    head flex items-center overflow-hidden h-24 p-10 mx-auto
    transform transition-all ease-in-out
    bg-black/30 backdrop-blur-lg
    ${isSlideDown ? "translate-y-0 opacity-100 duration-1000 delay-1000" : "-translate-y-32 opacity-0 duration-0"}
    ${isExpanded ? "w-full max-w-full justify-between duration-1000" : "w-full max-w-md justify-center"}
  `;

  const LogoSVG = ({ className }) => (
    <svg id="svg-2" className={className} viewBox="0 0 384 512">
      <path d={LOGO_PATH} />
    </svg>
  );

  return (
    <div className="min-h-fit bg-transparent z-50">
      <div className={getHeaderClassName()}>
        {/* Left Logo */}
        <div className="head-a flex-shrink-0">
          <LogoSVG className={`h-16 w-16 transition-opacity duration-300 fill-white ${showExtras ? "opacity-100" : "opacity-0"}`} />
        </div>
        
        <div className="h-10 w-10" />

        {/* Game Name */}
        <div className="Gamename flex items-center text-6xl uppercase text-white font-bold">
          <div className="relative left-2 bottom-2">CODE</div>
          <LogoSVG className="h-16 w-16" />
        </div>

        <div className="" />

        {/* Login/Signup or Play Button */}
        {isLoggedIn ? (
          <button
            className={`get-started px-4 py-2 ${showExtras ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={handlePlayClick}
          >
            Play
          </button>
        ) : (
          <button
            className={`get-started px-4 py-2 ${showExtras ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => setIsOpen(true)}
          >
            Login / Signup
          </button>
        )}

        <Modal
          title="Login"
          isOpen={isOpen}
          toggleModal={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
};

export default Header;