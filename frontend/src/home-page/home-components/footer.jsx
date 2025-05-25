import React, { useState, useEffect } from "react";
import Modal from "./login_modal";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate('/lobby');
    } else {
      setIsOpen(true);
    }
  };

  return (
    <footer className="bg-black text-white h-full w-full">
      <div className="max-w-6xl mx-auto px-5">
        {/* Call to action section */}
        <div className="bg-purple-700 text-white rounded-2xl p-6 flex justify-between items-center relative bottom-10">
          <span className="text-lg font-medium">Try for free today</span>
          <button
            className="bg-black text-white px-5 py-2 rounded-full flex items-center space-x-2"
            onClick={handleButtonClick}
          >
            <span>{isLoggedIn ? "Play Now" : "Sign up free"}</span>
            <span>&rarr;</span>
          </button>
          <Modal
            title="Signup"
            isOpen={isOpen}
            toggleModal={() => setIsOpen(false)}
          />
        </div>

        {/* Footer content */}
        <div className="mt-10 text-center grid grid-cols-2 md:grid-cols-4 gap-6 ">
          <div>
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 mt-2 text-gray-400">
              <li>Usage</li>
              <li>Docs</li>
              <li>Support</li>
              <li>Hardware</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Developers</h3>
            <ul className="space-y-2 mt-2 text-gray-400">
              <li>Forum</li>
              <li>Projects</li>
              <li>Source</li>
              <li>GitHub</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Pricing</h3>
            <ul className="space-y-2 mt-2 text-gray-400">
              <li>Plans</li>
              <li>Data</li>
              <li>Volume</li>
              <li>Clients</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 mt-2 text-gray-400">
              <li>About</li>
              <li>Brand</li>
              <li>Partners</li>
              <li>Careers</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
  