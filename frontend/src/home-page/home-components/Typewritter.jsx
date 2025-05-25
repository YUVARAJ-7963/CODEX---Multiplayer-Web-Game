import React, { useState, useEffect } from 'react';

const Typewritter = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const phrases = [
    "code efficiency",
    "Debugging skills",
    "Logic Building ",
    "Problem Solving",
    "Algorithm Mastery ",
    "Coding Speed",
    "Competitive Programming",
  ];

  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const typeSpeed = 100; // Speed for typing
    const deleteSpeed =25; // Speed for deleting
    const pauseTime = 2000; // Time to pause at complete phrase

    const currentPhrase = phrases[phraseIndex];

    const type = () => {
      if (!isDeleting) {
        // Typing
        if (text !== currentPhrase) {
          setText(currentPhrase.substring(0, text.length + 1));
        } else {
          // Pause before starting to delete
          setTimeout(() => setIsDeleting(true), pauseTime);
          return;
        }
      } else {
        // Deleting
        if (text !== '') {
          setText(currentPhrase.substring(0, text.length - 1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
          return;
        }
      }
    };

    const timeoutId = setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
    return () => clearTimeout(timeoutId);
  }, [text, phraseIndex, isDeleting, phrases]);

  return (
    <div>
      <div className=" text-5xl font-bold capitalize">
        {text}
        <span className="inline-block">|</span>
      </div>
      
 </div>
  );
};

export default Typewritter;