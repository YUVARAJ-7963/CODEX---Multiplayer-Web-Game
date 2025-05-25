import React, { useEffect, useState } from 'react';

const TextReveal = ({ text, stayTime = 2000 }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);

    const revealDelay = 50;
    const charDelay = 500; 
    const transitionDuration = 300;
    const revealDuration = (text.length - 1) * charDelay + transitionDuration;
    const hideDelay = revealDelay + revealDuration + stayTime;


    const revealTimer = setTimeout(() => {
      setRevealed(true);
    }, revealDelay);

    const hideTimer = setTimeout(() => {
      setRevealed(false);
    }, hideDelay);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(hideTimer);
    };
  }, [text, stayTime]);

  return (
    <div className="flex space-x-1">
      {text.split('').map((char, index) => (
        <span
          key={index}
          className={`inline-block transform transition-all duration-300 ease-out ${
            revealed
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: `${index * 500}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

export default TextReveal;