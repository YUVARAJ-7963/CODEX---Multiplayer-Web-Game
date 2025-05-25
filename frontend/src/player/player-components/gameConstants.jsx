import { FaTrophy, FaBug, FaBolt } from "react-icons/fa";
import { GiCrossedSwords } from "react-icons/gi";
import { BsPersonWorkspace } from "react-icons/bs";

// Import game images
import contestImage from "../player-images/contest.png";
import debugImage from "../player-images/debugging.png";
import flashImage from "../player-images/flash.png";
import pvpImage from "../player-images/practice-background.jpg";
import practiceImage from "../player-images/practice-background.jpg";

export const mainModes = [
  {
    id: 1,
    name: "Player vs Player",
    description: "Challenge other players in real-time coding battles",
    icon: <GiCrossedSwords className="text-4xl" />,
    type: "pvp",
    image: pvpImage,
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Practice Mode",
    description: "Improve your skills at your own pace",
    icon: <BsPersonWorkspace className="text-4xl" />,
    type: "practice",
    image: practiceImage,
    color: "#10B981",
  },
];

export const gameTypes = [
  {
    id: 1,
    name: "Software Contest",
    description: "Compete in timed coding challenges",
    image: contestImage,
    icon: <FaTrophy className="text-4xl" />,
    type: "contest",
    features: ["Timed Rounds", "Leaderboard", "Multiple Difficulty Levels"],
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Debugging",
    description: "Sharpen your debugging skills by finding and fixing code issues",
    image: debugImage,
    icon: <FaBug className="text-3xl" />,
    type: "debug",
    features: ["Real Code Scenarios", "Time Tracking", "Hint System"],
    color: "#EF4444",
  },
  {
    id: 3,
    name: "Flash Code",
    description: "Quick, intense coding challenges to test your speed",
    image: flashImage,
    icon: <FaBolt className="text-3xl" />,
    type: "flash",
    features: ["5-Minute Challenges", "Speed Focus", "Quick Solutions"],
    color: "#8B5CF6",
  },
];

export const difficulties = ["all", "Easy", "Medium", "Hard"];

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}; 