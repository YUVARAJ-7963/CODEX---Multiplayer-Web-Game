//game_card.jsx
import React from 'react';

const Card = ({heading, description,imageUrl}) => {
  return (
    <div className="relative h-[30em] w-[80em] border-2 border-[rgba(75,30,133,0.5)] rounded-[1.5em] bg-gradient-to-br from-[rgba(75,30,133,1)] via-purple-700/80 to-[rgba(75,30,133,0.2)] text-white font-nunito p-[1.5em] flex justify-center items-left flex-col gap-[1em] backdrop-blur-[12px] hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 group/card hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-fuchsia-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-[1.5em]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,50,190,0.1),transparent_60%)] group-hover/card:animate-pulse" />
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-purple-300/50" />
        <div className="w-2 h-2 rounded-full bg-purple-300/30" />
        <div className="w-2 h-2 rounded-full bg-purple-300/10" />
      </div>
      <div className="relative left-10 z-10 transition-transform duration-300 group-hover/card:translate-y-[-5px] space-y-3">
        <h1 className="text-[2.2em] font-bold bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
          {heading}
        </h1>
        <p className="text-[0.9em] text-purple-100/90 leading-relaxed font-light">
          {description}
        </p>
      </div>
      <div className='border absolute right-10 top-20 h-80 w-3/5 rounded-3xl bg-cover bg-center' style={{ backgroundImage: `url(${imageUrl})` }}></div>
      <button className="relative left-14 h-fit w-fit px-[1.4em] py-[0.7em] mt-2 border-[1px] border-purple-300/30 rounded-full flex justify-center items-center gap-[0.7em] overflow-hidden group/btn hover:border-purple-300/50 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all duration-300 backdrop-blur-[12px] bg-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-fuchsia-500/40 to-purple-600/40 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
        <p className="relative z-10 font-medium tracking-wide">Try Now</p>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="relative z-10 w-5 h-5 group-hover/btn:translate-x-[10%] transition-transform duration-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
      <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/20 to-transparent blur-sm group-hover/card:animate-pulse" />
    </div>
  );
}

export default Card;
