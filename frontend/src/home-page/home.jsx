import { motion } from 'framer-motion';
import React, { useEffect, useState, useCallback } from "react";
import "./home-css/home-css.css";
import "./home-css/intro_image.css";
import "./home-css/LogoAnimation.css";
import { useNavigate } from "react-router-dom";


import Typewritter from "./home-components/Typewritter.jsx";
import Languages from "./home-components/language_scroll_animation.jsx";
import Trygames from "./home-components/try_games_animation.jsx";
import TextReveal from "./home-components/TextReveal.jsx";
import Header from "./home-components/head_bar.jsx";
import Sideloader from "./home-components/side_loader.jsx";
import Modal from './home-components/login_modal.jsx';

const GetStartedButton = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (isLoggedIn) {
      navigate('/lobby');
    } else {
      setIsOpen(true);
    }
  }, [isLoggedIn, navigate]);

  return (
    <>
      <button className="get-started left-20" onClick={handleButtonClick}>
        {isLoggedIn ? "Play Now" : "Get Started"}
      </button>
      <Modal isOpen={isOpen} toggleModal={() => setIsOpen(false)} />
    </>
  );
});

const HomePage = () => {
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(false), 8000);
    const contentTimer = setTimeout(() => setShowContent(true), 8000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(contentTimer);
    }; 
  }, []);

  const LogoSection = () => (
    <div className="logo">
<div className="galaxy relative w-screen h-screen overflow-hidden">
  {/* Stars Background */}
  <div className="stars absolute top-0 left-0 right-0 bottom-0 z-0" />

  {/* Animated SVG Logo and Text */}
  <div className="relative load-page min-h-screen flex items-center justify-center z-20">
    <svg
      id="svg"
      className="absolute h-2/3 w-2/3 stroke-white"
      viewBox="0 0 384 512"
    >
      <path d="M162.7 210c-1.8 3.3-25.2 44.4-70.1 123.5-4.9 8.3-10.8 12.5-17.7 12.5H9.8c-7.7 0-12.1-7.5-8.5-14.4l69-121.3c.2 0 .2-.1 0-.3l-43.9-75.6c-4.3-7.8 .3-14.1 8.5-14.1H100c7.3 0 13.3 4.1 18 12.2l44.7 77.5zM382.6 46.1l-144 253v.3L330.2 466c3.9 7.1 .2 14.1-8.5 14.1h-65.2c-7.6 0-13.6-4-18-12.2l-92.4-168.5c3.3-5.8 51.5-90.8 144.8-255.2 4.6-8.1 10.4-12.2 17.5-12.2h65.7c8 0 12.3 6.7 8.5 14.1z" />
    </svg>

    <div className="absolute animated-logo-name bottom-72 w-96 text-[9rem] font-extrabold text-white overflow-hidden drop-shadow-2xl">
      <TextReveal text="CODE" />
    </div>
  </div>
</div>

    </div>
  );

  const MainContent = () => (
    <div className="">
<div className="stars absolute top-0 left-0 right-0 bottom-0 " />
      <div className="snap-start">
      <Header />
       
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease: "easeInOut" }}
        viewport={{ once: true }}
      >
        
        <IntroSection />
        <div className="">
          <Languages className="pg2" />
        </div>
        <div className="try-games_main snap-start">
          <Trygames />
        </div>
      </motion.div>
      </div>
    </div>
  );

  const IntroSection = () => (
    <div className="bg-transparent text-white w-full h-[85vh] overflow-hidden -z-50 pg1 ">
      <Sideloader className="h-full w-full" />
      <div className="relative top-14 left-20 w-max">
        <br />
        <div className="text-transparent bg-clip-text animate-gradient bg-gradient-to-r from-purple-500 via-cyan-500 to-rose-500">
          <h1 className="text-7xl uppercase font-bold">Upgrade your</h1>
          <br />
          <Typewritter />
          <br /> <br />
        </div>
        <p className="text-lg px-2">
          Upgrade your knowledge and sharpen your skills.
          <br />
          Stay ahead in the tech world with continuous learning.
        </p>
      </div>
      <br /> <br /> <br /> <br /> <br />
      <GetStartedButton />
    </div>
  );

  return (
    <div className="HOME bg-black snap-y snap-mandatory">
      {showLogo && <LogoSection />}
      {showContent && <MainContent />}
    </div>
  );
};

export default HomePage;
