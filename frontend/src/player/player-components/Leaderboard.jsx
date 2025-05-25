import React from "react";
import PlayerNameBar from "./Player_name_bar";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,  
  Tabs,
  Tab,
  
  Button,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import { FiSearch } from "react-icons/fi";
import { FaSortUp, FaSortDown } from "react-icons/fa";

// Remove unused imports and replace heroicons with a simpler solution

const API_BASE_URL = 'http://localhost:5000';

export default function LeaderBoard() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);
  const [sortDescriptor, setSortDescriptor] = React.useState({ column: "honorScore", direction: "descending" });
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState("overview");
  const [allItems, setAllItems] = React.useState([]);
  const [filteredItems, setFilteredItems] = React.useState([]);

  // Initialize list first
  let list = useAsyncList({
    async load({ signal, cursor }) {
      try {
        console.log('Fetching leaderboard data with params:', {
          page: cursor || 1,
          sort: sortDescriptor.column,
          order: sortDescriptor.direction,
          search: filterValue
        });
        
        const res = await fetch(`http://localhost:5000/api/leaderboard?page=${cursor || 1}&sort=${sortDescriptor.column}&order=${sortDescriptor.direction}&search=${encodeURIComponent(filterValue)}`, 
          { 
            signal, 
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        if (!res.ok) {
          console.error('API response not OK:', res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        let json = await res.json();
        console.log('API response:', json);
        
        setHasMore(json.next !== null);

        // Sort the results based on the current sort descriptor
        const sortedResults = [...json.results].sort((a, b) => {
          let aValue, bValue;
          
          if (sortDescriptor.column === 'honorScore') {
            // Honor score is already calculated from backend
            aValue = a.HonorScore || 0;
            bValue = b.HonorScore || 0;
          } else {
            aValue = a[sortDescriptor.column] || 0;
            bValue = b[sortDescriptor.column] || 0;
          }
          
          return sortDescriptor.direction === 'descending' ? bValue - aValue : aValue - bValue;
        });

        // Map items and assign ranks based on sorted order
        const mappedItems = sortedResults.map((player, index) => {
          // Honor score is already calculated from backend
          return {
            id: player._id,
            name: player.username,
            uid: player.UID,
            rank: player.GlobalRank, // Use the GlobalRank from backend
            totalScore: player.TotalScore || 0,
            battleScore: player.BattleScore || 0,
            honorScore: player.HonorScore || 0, // Use the HonorScore from backend
            globalRank: player.GlobalRank,
            challenges: player.Challenges,
            contest: {
              completed: player.ContestCompleted || 0,
              score: player.ContestScore || 0
            },
            debugging: {
              completed: player.DebuggingCompleted || 0,
              score: player.DebuggingScore || 0
            },
            flashcode: {
              completed: player.FlashCodeCompleted || 0,
              score: player.FlashCodeScore || 0
            },
            completedLevels: player.completedLevels || 0,
            lastActive: player.lastLogin,
            createdAt: player.createdAt,
            avatar: player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`,
            badges: player.badges || [],
            achievements: player.achievements || [],
            winRate: player.winRate || 0,
            streak: player.streak || 0
          };
        });
        
        console.log('Mapped items:', mappedItems);

        // Store all items for client-side filtering
        if (!cursor) {
          setAllItems(mappedItems);
          setFilteredItems(mappedItems);
        } else {
          setAllItems(prev => [...prev, ...mappedItems]);
          setFilteredItems(prev => [...prev, ...mappedItems]);
        }
        
        setIsLoading(false);

        return {
          items: mappedItems,
          cursor: json.next,
        };
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setIsLoading(false);
        throw error;
      }
    },
  });

  // Store list in a ref to avoid dependency issues
  const listRef = React.useRef(list);
  listRef.current = list;

  // Optimized search function
  const handleSearch = React.useCallback((value) => {
    setFilterValue(value);
    
    // Immediate client-side filtering
    if (!value.trim()) {
      setFilteredItems(allItems);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/); // Split search term into words

    const filtered = allItems.filter(item => {
      // Create a searchable string with all relevant fields
      const searchableString = [
        item.name,
        item.uid,
        item.globalRank?.toString(),
        item.totalScore?.toString(),
        item.battleScore?.toString(),
        item.honorScore?.toString()
      ].join(' ').toLowerCase();

      // Check if all search words are found in the searchable string
      return searchWords.every(word => searchableString.includes(word));
    });
    
    setFilteredItems(filtered);
    
    // Debounced API call for server-side filtering
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      listRef.current.reload();
    }, 300); // Increased debounce time for better performance

    return () => clearTimeout(timeoutId);
  }, [allItems, listRef]);

  // Reset loading state when sort or filter changes
  React.useEffect(() => {
    setIsLoading(true);
    listRef.current.reload();
  }, [sortDescriptor, filterValue]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({ hasMore, onLoadMore: list.loadMore });

  const overviewColumns = [
    { key: "globalRank", label: "Rank" },
    { key: "avatar", label: "" },
    { key: "uid", label: "UID" },
    { key: "name", label: "Name" },
    { key: "honorScore", label: "Honor Score" },
    { key: "totalScore", label: "Practice Score" },
    { key: "battleScore", label: "Battle Score" },
    { key: "lastActive", label: "Last Active" },
  ];

  const challengesColumns = [
    { key: "globalRank", label: "Rank" },
    { key: "avatar", label: "" },
    { key: "name", label: "Name" },
    { key: "challenges", label: "Total Challenges" },
    { key: "contest", label: "Contest" },
    { key: "debugging", label: "Debugging" },
    { key: "flashcode", label: "Flash Code" },
  ];

  const scoresColumns = [
    { key: "globalRank", label: "Rank" },
    { key: "avatar", label: "" },
    { key: "name", label: "Name" },
    { key: "totalScore", label: "Total Score" },
    { key: "contest", label: "Contest Score" },
    { key: "debugging", label: "Debugging Score" },
    { key: "flashcode", label: "Flash Code Score" },
  ];

  const getColumns = () => {
    switch (selectedTab) {
      case "overview":
        return overviewColumns;
      case "challenges":
        return challengesColumns;
      case "scores":
        return scoresColumns;
      default:
        return overviewColumns;
    }
  };

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "avatar":
        return (
          <div className="flex items-center justify-center">
            {item.uid ? (
              <img 
                src={`${API_BASE_URL}/api/profile/${item.uid}/avatar?t=${new Date().getTime()}`}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-sm"
                onError={(e) => {
                  // Fallback to default avatar on error
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500 shadow-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            {item.badges && item.badges.length > 0 && (
              <div className="ml-2 flex -space-x-1">
                {item.badges.slice(0, 2).map((badge, index) => (
                  <img 
                    key={index}
                    src={badge.icon}
                    alt={badge.name}
                    className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                  />
                ))}
                {item.badges.length > 2 && (
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-purple-600 dark:text-purple-400 font-semibold shadow-sm">
                    +{item.badges.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "challenges":
        return (
          <div className="flex items-center justify-center">
            <span>{item.challenges?.completedChallenges || 0}</span>
          </div>
        );
      case "contest":
        return (
          <div className="flex items-center justify-center">
            <span>{`${item.contest?.completed || 0} (${item.contest?.score || 0})`}</span>
          </div>
        );
      case "debugging":
        return (
          <div className="flex items-center justify-center">
            <span>{`${item.debugging?.completed || 0} (${item.debugging?.score || 0})`}</span>
          </div>
        );
      case "flashcode":
        return (
          <div className="flex items-center justify-center">
            <span>{`${item.flashcode?.completed || 0} (${item.flashcode?.score || 0})`}</span>
          </div>
        );
      case "globalRank":
        return (
          <div className="flex items-center justify-center">
            <span className={`
              inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold
              ${item.globalRank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' : 
                item.globalRank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                item.globalRank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' : 
                'bg-gradient-to-r from-blue-400 to-blue-500 text-white'}
            `}>
              #{item.globalRank || 0}
            </span>
          </div>
        );
      case "uid":
        return (
          <div className="flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-400">{item[columnKey] || "N/A"}</span>
          </div>
        );
      case "name":
        return (
          <div className="flex items-center justify-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{item[columnKey] || "Unknown"}</span>
          </div>
        );
      case "totalScore":
        return (
          <div className="flex items-center justify-center">
            <span className="font-semibold text-purple-600 dark:text-purple-400">{item[columnKey] || 0}</span>
          </div>
        );
      case "battleScore":
        return (
          <div className="flex items-center justify-center">
            <span className="font-semibold text-purple-600 dark:text-purple-400">{item[columnKey] || 0}</span>
          </div>
        );
      case "honorScore":
        return (
          <div className="flex items-center justify-center">
            <span className="font-semibold text-purple-600 dark:text-purple-400">{item[columnKey] || 0}</span>
          </div>
        );
      case "lastActive":
        return (
          <div className="flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(item[columnKey])}</span>
          </div>
        );
      default:
        return <span className="block text-left text-gray-700 dark:text-gray-300">{item[columnKey] || 0}</span>;
    }
  };

  // Add search placeholder text based on selected tab
  const getSearchPlaceholder = () => {
    switch (selectedTab) {
      case "overview":
        return "Search by name, UID, rank, or score...";
      case "challenges":
        return "Search by name, UID, or challenge count...";
      case "scores":
        return "Search by name, UID, or score...";
      default:
        return "Search by name or UID...";
    }
  };

  // Add sort direction toggle function
  const toggleSortDirection = () => {
    setSortDescriptor(prev => ({
      ...prev,
      direction: prev.direction === "ascending" ? "descending" : "ascending"
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 p-5">
      <PlayerNameBar 
        Pagename={"Leader Board"} 
        Search={"true"} 
        onSearchChange={handleSearch} 
      />
      
      {/* Search Bar */}
      <div className="mb-4 flex items-center justify-between px-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <FiSearch className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={filterValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-300"
          />
        </div>
        <Button
          onClick={toggleSortDirection}
          className="ml-4 px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-300 flex items-center gap-2"
        >
          Sort {sortDescriptor.direction === "ascending" ? "↑" : "↓"}
          {sortDescriptor.direction === "ascending" ? <FaSortUp /> : <FaSortDown />}
        </Button>
      </div>
      
      <Tabs 
        selectedKey={selectedTab} 
        onSelectionChange={setSelectedTab}
        className="mb-4 ml-4"
        classNames={{
          tabList: "gap-4",
          cursor: "bg-gradient-to-r from-purple-600 to-indigo-600",
          tab: "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 data-[selected=true]:text-purple-600 dark:data-[selected=true]:text-purple-400",
        }}
      >
        <Tab key="overview" title="Overview" />
        <Tab key="challenges" title="Challenges" />
        <Tab key="scores" title="Scores" />
      </Tabs>

      <Table
        isHeaderSticky
        baseRef={scrollerRef}
        aria-label="Leaderboard table showing player rankings and scores"
        bottomContent={
          hasMore ? (
            <div className="flex w-full justify-center p-4">
              <Spinner ref={loaderRef} color="primary" size="lg" />
            </div>
          ) : null
        }
        classNames={{
          base: "max-h-[85vh] overflow-y-scroll rounded-lg shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          table: "min-h-[400px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
          thead: "bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50",
          tbody: "bg-white dark:bg-gray-800",
          tr: "hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200",
          th: "text-gray-900 dark:text-gray-100 font-semibold text-sm uppercase tracking-wider",
          td: "text-gray-700 dark:text-gray-300 font-medium"
        }}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          {getColumns().map((column) => (
            <TableColumn 
              key={column.key}
              allowsSorting={column.key !== "avatar"}
              className="text-center py-4 px-4 border-b border-purple-700 dark:border-purple-600"
              onClick={() => {
                if (column.key !== "avatar") {
                  setSortDescriptor({
                    column: column.key,
                    direction: sortDescriptor.direction
                  });
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {column.key === "avatar" ? (
                  <div className="flex items-center">
                    <span className="text-gray-900 dark:text-gray-100">Avatar</span>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 dark:text-gray-100">{column.label}</span>
                    {sortDescriptor.column === column.key && (
                      sortDescriptor.direction === "ascending" ? <FaSortUp /> : <FaSortDown />
                    )}
                  </>
                )}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={filteredItems}
          loadingContent={
            <div className="flex justify-center items-center p-8">
              <Spinner color="primary" size="lg" />
            </div>
          }
          emptyContent={
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No matches found</div>
              <div className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search terms</div>
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
              {(columnKey) => (
                <TableCell className="py-4 px-4 border-b border-gray-100 dark:border-gray-700/50">
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Never";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // If less than 1 minute
  if (diffInSeconds < 60) {
    return "Just now";
  }
  
  // If less than 1 hour
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}min ago`;
  }
  
  // If less than 24 hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}hr ago`;
  }
  
  // If less than 7 days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  // If less than 30 days
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  // If less than 365 days
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  // If more than a year
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}year${diffInYears !== 1 ? 's' : ''} ago`;
}
