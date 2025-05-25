import { Home, LineChart, Mic, Settings, LogOut, Gamepad2Icon} from "lucide-react";

export default function Sidebar({onSelect, selected}) {
  return (
    <div className="fixed top-0 h-screen w-20 bg-gradient-to-b from-purple-700 to-indigo-800 dark:from-purple-900 dark:to-indigo-900 flex flex-col items-center py-6 space-y-6 rounded-r-3xl shadow-lg hover:w-48 transition-all duration-300 group z-50">
      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-lg shadow-md hover:scale-110 transition-transform animate-bounce">
        <svg
          className="w-6 h-6 stroke-purple-700 dark:stroke-purple-500 fill-purple-700 dark:fill-purple-500"
          viewBox="0 0 384 512"
        >
          <path d="M162.7 210c-1.8 3.3-25.2 44.4-70.1 123.5-4.9 8.3-10.8 12.5-17.7 12.5H9.8c-7.7 0-12.1-7.5-8.5-14.4l69-121.3c.2 0 .2-.1 0-.3l-43.9-75.6c-4.3-7.8 .3-14.1 8.5-14.1H100c7.3 0 13.3 4.1 18 12.2l44.7 77.5zM382.6 46.1l-144 253v.3L330.2 466c3.9 7.1 .2 14.1-8.5 14.1h-65.2c-7.6 0-13.6-4-18-12.2l-92.4-168.5c3.3-5.8 51.5-90.8 144.8-255.2 4.6-8.1 10.4-12.2 17.5-12.2h65.7c8 0 12.3 6.7 8.5 14.1z" />
        </svg>
      </div>
      
      <div className="flex flex-col h-96 justify-evenly w-full items-center">
        {[
          { icon: <Home size={24} />, label: "Home" },
          { icon: <Gamepad2Icon size={24} />, label: "Games" },
          { icon: <LineChart size={24} />, label: "Leader Board" },
          { icon: <Mic size={24} />, label: "Announcements" },
          { icon: <Settings size={24} />, label: "Settings" },
        ].map(({icon, label}, index) => (
          <div 
            key={label}
            onClick={() => onSelect(label)}
            className={`w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-md hover:scale-110 transition-all cursor-pointer group-hover:w-36 ${
              selected === label ? 'ring-2 ring-purple-400 dark:ring-purple-500 bg-purple-50 dark:bg-purple-900/30' : ''
            }`}
            style={{
              animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            {icon}
            <span className="hidden group-hover:block ml-2 text-sm font-medium text-purple-700 dark:text-purple-200">{label}</span>
          </div>
        ))}
      </div>

      <div 
        onClick={() => onSelect("Logout")}
        className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-md hover:scale-110 transition-all cursor-pointer group-hover:w-36 hover:bg-red-50 dark:hover:bg-red-900/30"
      >
        <LogOut size={24} />
        <span className="hidden group-hover:block ml-2 text-sm font-medium text-red-600 dark:text-red-400">Logout</span>
      </div>
    </div>
  );
}