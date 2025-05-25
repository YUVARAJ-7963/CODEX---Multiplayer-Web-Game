import { useState, useEffect } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { Dialog } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactConfetti from 'react-confetti';
import io from 'socket.io-client';

// Piston API configuration
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

// Language mapping for Piston with versions
const LANGUAGE_MAPPING = {
    python: {
        name: "python",
        version: "3.10.0"
    },
    java: {
        name: "java",
        version: "15.0.2"
    },
    cpp: {
        name: "cpp",
        version: "10.2.0"  // Let Piston choose the default version
    },
    c: {
        name: "c",
        version: "10.2.0"  // Let Piston choose the default version
    }
};

// File extensions for different languages
const FILE_EXTENSIONS = {
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c"
};

// Language templates
const LANGUAGE_TEMPLATES = {
    python: `import sys

def main():
    # Your code here
    pass

if __name__ == "__main__":
    main()`,
    java: `import java.util.Scanner;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        try {
            // Your code here
            
        } finally {
            scanner.close();
        }
    }
}`,
    cpp: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Your code here
    
    return 0;
}`
};

// Update CodeDisplay component with new design
const CodeDisplay = ({ targetCode, userInput, setUserInput, calculateProgress, theme }) => {
    const [isReading, setIsReading] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);

    const themeStyles = {
        dark: {
            bg: "bg-[#1E1E1E]",
            text: "text-white",
            textSecondary: "text-gray-400",
            border: "border-purple-500/30",
            progressBg: "bg-gradient-to-r from-purple-600 to-pink-600",
            progressText: "text-white",
            indicatorBg: "bg-purple-500/20",
            indicatorText: "text-purple-400"
        },
        light: {
            bg: "bg-white",
            text: "text-gray-800",
            textSecondary: "text-gray-600",
            border: "border-purple-300",
            progressBg: "bg-gradient-to-r from-purple-500 to-pink-500",
            progressText: "text-white",
            indicatorBg: "bg-purple-100",
            indicatorText: "text-purple-600"
        }
    };

    const currentTheme = theme === "vs-dark" ? themeStyles.dark : themeStyles.light;

    const renderCharacter = (char, index) => {
        if (isReading) {
            return <span key={index} className={currentTheme.text}>{char}</span>;
        }

        if (index >= userInput.length) {
            return <span key={index} className={currentTheme.textSecondary}>{char}</span>;
        }

        const isCorrect = userInput[index] === char;
        return (
            <span 
                key={index} 
                className={`${
                    isCorrect ? 'text-green-500' : 'text-red-500'
                } transition-colors duration-200`}
            >
                {char}
            </span>
        );
    };

    // Add keyboard event listener
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Handle Tab key
            if (event.key === 'Tab') {
                event.preventDefault();
                setUserInput(prev => prev + '     '); // 5 spaces
                setCursorPosition(prev => prev + 5);
                return;
            }

            // Handle Enter key
            if (event.key === 'Enter') {
                event.preventDefault();
                setUserInput(prev => prev + '\n');
                setCursorPosition(prev => prev + 1);
                return;
            }

            // Prevent default behavior for spacebar
            if (event.key === ' ') {
                event.preventDefault();
                setUserInput(prev => prev + ' ');
                setCursorPosition(prev => prev + 1);
                return;
            }

            // Handle backspace
            if (event.key === 'Backspace') {
                event.preventDefault();
                setUserInput(prev => prev.slice(0, -1));
                setCursorPosition(prev => Math.max(0, prev - 1));
                return;
            }
            
            // Only process printable characters
            if (event.key.length === 1) {
                event.preventDefault();
                setUserInput(prev => prev + event.key);
                setCursorPosition(prev => prev + 1);
            }
        };

        window.addEventListener('keydown', handleKeyPress, true);
        return () => window.removeEventListener('keydown', handleKeyPress, true);
    }, [setUserInput]);

    return (
        <div className="flex flex-col items-center justify-center flex-grow p-8">
            <div className="w-3/4">
                <div className={`${currentTheme.bg} p-8 rounded-xl border ${currentTheme.border} shadow-lg relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                    <pre className={`font-mono text-lg leading-relaxed whitespace-pre-wrap relative ${currentTheme.text} select-none`}>
                        {targetCode.split('').map((char, index) => renderCharacter(char, index))}
                    </pre>
                </div>
            </div>
        </div>
    );
};

// Initialize socket connection
const socket = io('http://localhost:5000');

// Add language detection function
const detectLanguage = (code) => {
    console.log('Detecting language for code:', code);
    if (!code) {
        console.log('No code provided, defaulting to Python');
        return 'python';
    }

    // Define language-specific patterns
    const patterns = {
        java: [
            /public\s+class/,
            /import\s+java\./,
            /extends\s+[A-Za-z]+/,
            /implements\s+[A-Za-z]+/
        ],
        cpp: [
            /#include\s*<[^>]+>/,
            /using\s+namespace\s+std;/,
            /class\s+[A-Za-z]+/,
            /std::/
        ],
        c: [
            /#include\s*<[^>]+>/,
            /printf\s*\(/,
            /scanf\s*\(/,
            /malloc\s*\(/
        ],
        python: [
            /def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
            /import\s+[a-zA-Z_][a-zA-Z0-9_]*/,
            /from\s+[a-zA-Z_][a-zA-Z0-9_]*\s+import/,
            /if\s+__name__\s*==\s*['"]__main__['"]/
        ]
    };

    // Count matches for each language
    const scores = {
        java: 0,
        cpp: 0,
        c: 0,
        python: 0
    };

    // Check each pattern for each language
    Object.entries(patterns).forEach(([lang, langPatterns]) => {
        langPatterns.forEach(pattern => {
            if (pattern.test(code)) {
                scores[lang]++;
            }
        });
    });

    // Find the language with the highest score
    const maxScore = Math.max(...Object.values(scores));
    const detectedLang = Object.entries(scores).find(([_, score]) => score === maxScore)[0];

    console.log('Language detection scores:', scores);
    console.log('Detected language:', detectedLang);
    return detectedLang;
};

// Theme styles
const themeStyles = {
    dark: {
        bg: "bg-[#0F0A1F]",
        header: "bg-[#1A1127]",
        panel: "bg-[#1A1127]",
        input: "bg-[#2D1F47]",
        border: "border-purple-500/30",
        text: "text-purple-300",
        textSecondary: "text-purple-200/80",
        shadow: "shadow-[0_0_10px_rgba(147,51,234,0.3)]",
        buttonHover: "hover:bg-[#3D2A5F]"
    },
    light: {
        bg: "bg-white",
        header: "bg-gray-50",
        panel: "bg-gray-50",
        input: "bg-white",
        border: "border-purple-300",
        text: "text-gray-800",
        textSecondary: "text-gray-600",
        shadow: "shadow-[0_0_10px_rgba(147,51,234,0.2)]",
        buttonHover: "hover:bg-purple-50"
    },
    tooltip: {
        dark: {
            bg: "bg-[#2D1F47]",
            text: "text-purple-300",
            arrow: "bg-[#2D1F47]"
        },
        light: {
            bg: "bg-gray-100",
            text: "text-gray-800",
            arrow: "bg-gray-100"
        }
    }
};



export default function Playground() {
    const location = useLocation();
    const navigate = useNavigate();

    const [theme, setTheme] = useState("vs-dark");
    const [isLoading, setIsLoading] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Initialize state with location data
    const [gameData, setGameData] = useState(() => {
        const data = location.state;
        if (!data) {
            console.error('No game data received');
            navigate('/lobby');
            return null;
        }
        return data;
    });

    // Socket-related state
    const [opponentCode, setOpponentCode] = useState("");
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [winnerMessage, setWinnerMessage] = useState("");
    const [roomId, setRoomId] = useState(gameData?.roomId);
    const [opponent, setOpponent] = useState(gameData?.opponent);

    // Game state
    const [code, setCode] = useState(() => {
        console.log('Initializing code state');
        if (location.state?.gameType === 'debugging' && location.state?.buggycode) {
            console.log('Setting initial code from buggycode');
            return location.state.buggycode;
        }
        console.log('Setting initial code from template');
        return LANGUAGE_TEMPLATES[gameData?.language || 'python'];
    });

    const [language, setLanguage] = useState(() => {
        console.log('Initializing language state');
        console.log('Location state:', location.state);
        if (location.state?.gameType === 'debugging' && location.state?.buggycode) {
            const detectedLang = detectLanguage(location.state.buggycode);
            console.log('Initial language set to:', detectedLang);
            return detectedLang;
        }
        console.log('Defaulting to Python');
        return gameData?.language || 'python';
    });

    const [output, setOutput] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [text, setText] = useState(gameData?.codeFile || '');
    const [confirmGiveUp, setConfirmGiveUp] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);
    const [allTestsPassed, setAllTestsPassed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Add handlers to prevent copy/paste/selection
    useEffect(() => {
        const preventDefaultAction = (e) => {
            e.preventDefault();
            return false;
        };

        const preventKeyboardShortcuts = (e) => {
            if (
                (e.ctrlKey || e.metaKey) && 
                (e.key === 'c' || e.key === 'v' || e.key === 'a')
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Prevent selection
        document.addEventListener('selectstart', preventDefaultAction);
        // Prevent copy
        document.addEventListener('copy', preventDefaultAction);
        // Prevent paste
        document.addEventListener('paste', preventDefaultAction);
        // Prevent keyboard shortcuts
        document.addEventListener('keydown', preventKeyboardShortcuts);

        return () => {
            document.removeEventListener('selectstart', preventDefaultAction);
            document.removeEventListener('copy', preventDefaultAction);
            document.removeEventListener('paste', preventDefaultAction);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
        };
    }, []);

    // Add window resize handler
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Add event listeners for page unload and back button
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!gameEnded) {
                e.preventDefault();
                e.returnValue = '';
                handleGiveUp();
            }
        };

        const handlePopState = (e) => {
            if (!gameEnded) {
                handleGiveUp();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [gameEnded]);

    const currentTheme = theme === "vs-dark" ? themeStyles.dark : themeStyles.light;

    // Add debug logging for state changes
    useEffect(() => {
        console.log('Language state changed to:', language);
    }, [language]);

    useEffect(() => {
        console.log('Code state changed to:', code);
    }, [code]);

    // Update effect to handle debugging initialization
    useEffect(() => {
        if (location.state?.gameType === 'debugging' && location.state?.buggycode) {
            console.log('Updating code with buggycode:', location.state.buggycode);
            const buggyCode = location.state.buggycode;
            const detectedLanguage = detectLanguage(buggyCode);
            
            console.log('Setting language to:', detectedLanguage);
            console.log('Setting code to:', buggyCode);
            setLanguage(detectedLanguage);
            setCode(buggyCode);
        }
    }, [location.state]);

    // Add tooltip timeout cleanup
    useEffect(() => {
        if (showTooltip) {
            const timer = setTimeout(() => {
                setShowTooltip(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showTooltip]);

    // Loading animation component
    const LoadingSpinner = () => (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
            <div className="relative w-16 h-16">
                <div className="absolute w-16 h-16 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    const toggleTheme = () => {
        setTheme(theme === "vs-dark" ? "light" : "vs-dark");
    };

    // Socket event listeners
    useEffect(() => {
        if (!roomId) return;

        socket.emit('join_room', roomId);

        socket.on('code_update', (newCode) => {
            setOpponentCode(newCode);
        });

        socket.on('progress_update', ({ progress }) => {
            setOpponentProgress(progress);
        });

        socket.on('opponent_gave_up', (data) => {
            setGameEnded(true);
            const message = data?.loser?.username 
                ? `${data.loser.username} gave up! You win!`
                : 'Your opponent gave up! You win!';
            setWinnerMessage(message);
            setShowSuccessDialog(true);
            setTimeout(() => {
                navigate('/lobby');
            }, 5000);
        });

        socket.on('challenge_won', (data) => {
            setGameEnded(true);
            const message = `Congratulations! You won the challenge!`;
            setWinnerMessage(message);
            setShowSuccessDialog(true);
            setTimeout(() => {
                navigate('/lobby');
            }, 5000);
        });

        socket.on('opponent_won_challenge', (data) => {
            setGameEnded(true);
            const message = data?.winner?.username 
                ? `Your opponent ${data.winner.username} has won the challenge!`
                : 'Your opponent has won the challenge!';
            setWinnerMessage(message);
            setShowSuccessDialog(true);
            setTimeout(() => {
                navigate('/lobby');
            }, 5000);
        });

        return () => {
            socket.off('code_update');
            socket.off('progress_update');
            socket.off('opponent_gave_up');
            socket.off('challenge_won');
            socket.off('opponent_won_challenge');
        };
    }, [roomId, navigate]);

    // Update code change handler
    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (roomId) {
            socket.emit('code_update', { roomId, code: newCode });
        }
    };

    // Calculate progress for flashcode mode
    const calculateProgress = () => {
        if (!userInput || !text) return 0;
        
        let correctChars = 0;
        let totalChars = text.length;
        
        for (let i = 0; i < userInput.length && i < text.length; i++) {
            if (userInput[i] === text[i]) {
                correctChars++;
            }
        }

        const progress = Math.round((correctChars / totalChars) * 100);
        
        if (roomId) {
            socket.emit('progress_update', { roomId, progress });
        }
        
        return progress;
    };

    // Handle give up
    const handleGiveUp = () => {
        setConfirmGiveUp(true);
    };

    const confirmGiveUpAction = () => {
        if (roomId) {
            const loserInfo = {
                username: gameData?.username || 'Anonymous',
                uid: gameData?.uid || 'unknown'
            };
            
            socket.emit('give_up', { 
                roomId,
                loser: loserInfo
            });
            
            setGameEnded(true);
            setWinnerMessage("You gave up!");
            setShowSuccessDialog(true);
            setTimeout(() => {
                navigate('/lobby');
            }, 5000);
        }
        setConfirmGiveUp(false);
    };

    // Execute code with Piston API
    const executeCodeWithPiston = async (code, input = "") => {
        setIsLoading(true);
        try {
            let formattedCode = code;
            
            if (language === "python") {
                formattedCode = code.replace(
                    /input\([^)]*\)/g,
                    "sys.stdin.readline().strip()"
                );
                if (!formattedCode.includes("import sys")) {
                    formattedCode = "import sys\n" + formattedCode;
                }
            } else if (language === "java") {
                if (!code.includes("public class")) {
                    formattedCode = `import java.util.Scanner;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        try {
            ${code}
        } finally {
            scanner.close();
        }
    }
}`;
                }
            } else if (language === "c") {
                formattedCode = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    ${code}
    return 0;
}`;
            }

            const response = await axios.post(
                PISTON_API_URL,
                {
                    language: LANGUAGE_MAPPING[language].name,
                    version: LANGUAGE_MAPPING[language].version,
                    files: [
                        {
                            name: `main.${FILE_EXTENSIONS[language]}`,
                            content: formattedCode
                        }
                    ],
                    stdin: input,
                    args: [],
                    timeout: 5000
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            let output = response.data.run?.stdout || response.data.stdout || "";
            const error = response.data.run?.stderr || response.data.stderr || null;

            if (language === "java") {
                output = output.replace(/^Picked up .*\n/gm, "");
            }

            if (error) {
                output = `Error:\n${error}\n\nOutput:\n${output}`;
            }

            return {
                output: output.trim(),
                error: error
            };
        } catch (error) {
            console.error("API Error:", error.response?.data);
            throw new Error(error.response?.data?.error || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Run code function
    const runCode = async () => {
        setIsLoading(true);
        try {
            let testResults = [];
            const testCases = gameData?.testCases || [];
            
            if (testCases.length > 0) {
                for (const testCase of testCases) {
                    const startTime = performance.now();
                    const pistonResult = await executeCodeWithPiston(code, testCase.input);
                    const endTime = performance.now();
                    const executionTimeMs = endTime - startTime;
                    
                    if (pistonResult.error) {
                        testResults.push({
                            input: testCase.input,
                            output: pistonResult.output,
                            expectedOutput: testCase.output,
                            passed: false,
                            executionTime: executionTimeMs,
                            error: pistonResult.error
                        });
                        break;
                    }
                    
                    const cleanOutput = pistonResult.output.replace(/[^0-9-]/g, '').trim();
                    const cleanExpected = testCase.output.replace(/[^0-9-]/g, '').trim();
                    
                    testResults.push({
                        input: testCase.input,
                        output: pistonResult.output,
                        expectedOutput: testCase.output,
                        passed: cleanOutput === cleanExpected,
                        executionTime: executionTimeMs
                    });
                }
                
                // Check if all tests passed
                const allPassed = testResults.every(result => result.passed);
                setAllTestsPassed(allPassed);
                
                const resultsText = testResults.map((result, index) => 
                    `Test Case ${index + 1}:\n` +
                    `Input: ${result.input}\n` +
                    (result.error ? `Error: ${result.error}\n` : 
                    `Expected Output: ${result.expectedOutput}\n` +
                    `Your Output: ${result.output}\n` +
                    `Execution Time: ${result.executionTime.toFixed(2)}ms\n` +
                    `Status: ${result.passed ? '✓ Passed' : '✗ Failed'}` +
                    (result.passed ? '' : '\nNote: If your output includes descriptive text, that\'s okay - we only compare the numbers')) +
                    '\n\n'
                ).join('---\n');
                
                const passedTests = testResults.filter(r => r.passed).length;
                const totalTests = testResults.length;
                const summaryText = `\nSummary:\n${passedTests} out of ${totalTests} tests passed.`;
                
                setOutput(resultsText + summaryText);
                setExecutionTime(testResults.reduce((sum, r) => sum + r.executionTime, 0));
                
                // Update test case status
                if (gameData?.testCases) {
                    gameData.testCases = gameData.testCases.map((testCase, index) => ({
                        ...testCase,
                        passed: testResults[index]?.passed || false
                    }));
                }

                // Check if all tests passed and show celebration
                const allTestsPassed = testResults.every(result => result.passed);
                if (allTestsPassed) {
                    setSubmissionStatus('All Tests Passed!');
                    setShowConfetti(true);
                    setTimeout(() => {
                        setSubmissionStatus(null);
                    }, 5000);
                } else {
                    setSubmissionStatus('Some Tests Failed');
                    setTimeout(() => {
                        setSubmissionStatus(null);
                    }, 5000);
                }
            } else {
                const startTime = performance.now();
                const pistonResult = await executeCodeWithPiston(code, "");
                const endTime = performance.now();
                setExecutionTime(endTime - startTime);
                setOutput(pistonResult.output);
                
                setSubmissionStatus('Code Executed Successfully!');
                setShowConfetti(true);
                setTimeout(() => {
                    setSubmissionStatus(null);
                }, 5000);
            }
        } catch (error) {
            setAllTestsPassed(false);
            setOutput(`Error executing code:\n${error.message}`);
            setSubmissionStatus('Error');
            setTimeout(() => {
                setSubmissionStatus(null);
            }, 5000);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle code submission
    const submitCode = async () => {
        if (gameData?.gameType === 'flashcode') {
            const currentProgress = calculateProgress();
            if (currentProgress < 80) {
                alert("You need to achieve at least 80% accuracy to submit!");
                return;
            }
        }

        setIsLoading(true);
        try {
            const updateResponse = await axios.post('http://localhost:5000/api/user/update-challenge-score', {
                uid: gameData?.uid,
                challengeType: gameData?.gameType,
                points: gameData?.points
            });
            
            if (updateResponse.data.success) {
                // Emit challenge completion event
                if (roomId) {
                    socket.emit('challenge_completed', {
                        roomId,
                        winner: {
                            username: gameData?.username,
                            uid: gameData?.uid
                        }
                    });
                }

                // Don't set success message here as it will be handled by the socket event
                setShowSuccessDialog(true);
                setTimeout(() => {
                    navigate('/lobby');
                }, 5000);
            }
        } catch (error) {
            console.error('Error during submission:', error);
            setSuccessMessage('Error updating scores. Please try again.');
            setShowSuccessDialog(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`h-screen w-screen overflow-hidden ${currentTheme.bg} ${currentTheme.text} flex flex-col select-none`}>
            {showConfetti && (
                <ReactConfetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={300}
                    gravity={0.35}
                    tweenDuration={2000}
                    initialVelocityY={20}
                    colors={['#9333EA', '#DB2777', '#7C3AED', '#EC4899', '#8B5CF6', '#F0ABFC']}
                    style={{ zIndex: 9999 }}
                />
            )}
            {isLoading && <LoadingSpinner />}
            
            {/* Header */}
            <header className={`${currentTheme.header} border-b ${currentTheme.border} p-4 flex justify-between items-center ${currentTheme.shadow} select-none`}>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        CODEX
                    </h1>
                    <div className="flex flex-col">
                        <h2 className={`text-lg font-semibold ${
                            theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                        }`}>
                            {gameData?.gameType?.charAt(0).toUpperCase() + gameData?.gameType?.slice(1) || 'Contest'}
                        </h2>
                        <span className={`text-sm ${
                            theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                        }`}>
                            Battle Mode
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className={`${
                            theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                        }`}>Player:</span>
                        <span className={`font-mono ${
                            theme === "vs-dark" ? "text-white" : "text-gray-800"
                        }`}>{gameData?.username || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`${
                            theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                        }`}>UID:</span>
                        <span className={`font-mono ${
                            theme === "vs-dark" ? "text-white" : "text-gray-800"
                        }`}>{gameData?.uid || 'N/A'}</span>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className={`px-3 py-1 rounded-lg ${currentTheme.input} ${currentTheme.buttonHover} transition-colors
                        border ${currentTheme.border}`}
                    >
                        {theme === "vs-dark" ? "🌞" : "🌙"}
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`${
                            theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                        }`}>Score:</span>
                        <span className={`font-mono ${
                            theme === "vs-dark" ? "text-white" : "text-gray-800"
                        }`}>{gameData?.points ? gameData.points * 2 : 0}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {gameData?.gameType === 'flashcode' ? (
                    <div className={`w-full flex flex-col overflow-y-auto ${
                        theme === "vs-dark" 
                            ? "bg-gradient-to-br from-[#0F0A1F] to-[#1A1127]" 
                            : "bg-gradient-to-br from-gray-50 to-white"
                    }`}>
                        <div className={`p-4 sticky top-0 z-10 ${
                            theme === "vs-dark"
                                ? "bg-gradient-to-r from-purple-900/20 to-pink-900/20"
                                : "bg-gradient-to-r from-purple-100/50 to-pink-100/50"
                        } backdrop-blur-sm`}>
                            <div className="w-full px-8">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h2 className={`text-xl font-bold ${
                                                theme === "vs-dark"
                                                    ? "bg-gradient-to-r from-purple-400 to-pink-400"
                                                    : "bg-gradient-to-r from-purple-600 to-pink-600"
                                            } bg-clip-text text-transparent mb-1`}>
                                                {gameData?.title || 'Loading...'}
                                            </h2>
                                            <p className={`text-sm leading-relaxed ${
                                                theme === "vs-dark" ? "text-gray-300" : "text-gray-600"
                                            }`}>
                                                {gameData?.description || 'Loading problem details...'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button 
                                                onClick={submitCode}
                                                className={`px-6 py-2 rounded-lg ${
                                                    theme === "vs-dark"
                                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                                } transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]
                                                text-white text-sm font-semibold transform hover:scale-105 active:scale-95`}
                                            >
                                                Submit
                                            </button>
                                            <button
                                                onClick={handleGiveUp}
                                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
                                                transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]
                                                text-white text-sm font-semibold transform hover:scale-105 active:scale-95"
                                            >
                                                Give Up
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-opacity-50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                                        <div className="flex items-center gap-6">
                                            <div className={`${
                                                theme === "vs-dark"
                                                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                                            } px-6 py-3 rounded-lg shadow-lg`}>
                                                <span className="text-white text-xl font-mono">
                                                    {calculateProgress()}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                                    <span className={`text-sm ${
                                                        theme === "vs-dark" ? "text-gray-300" : "text-gray-600"
                                                    }`}>Correct</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                                    <span className={`text-sm ${
                                                        theme === "vs-dark" ? "text-gray-300" : "text-gray-600"
                                                    }`}>Incorrect</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`${
                                                theme === "vs-dark" ? "bg-purple-500/20" : "bg-purple-100"
                                            } px-4 py-2 rounded-lg`}>
                                                <span className={`${
                                                    theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                                                } text-sm`}>
                                                    Characters Left: {text.length - userInput.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {gameData?.gameMode === 'pvp' && gameData?.gameType === 'flashcode' && (
                                        <div className="flex items-center gap-4 bg-opacity-50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                                            <div className="flex items-center gap-2 min-w-[200px]">
                                                <span className={`text-sm ${
                                                    theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                                                }`}>
                                                    Opponent: {opponent?.username || 'Unknown'}
                                                </span>
                                                <span className={`text-sm ${
                                                    theme === "vs-dark" ? "text-purple-400" : "text-purple-600"
                                                }`}>
                                                    {opponentProgress}%
                                                </span>
                                            </div>
                                            <div className={`flex-1 h-2 ${
                                                theme === "vs-dark" ? "bg-[#2D1F47]" : "bg-purple-100"
                                            } rounded-full overflow-hidden`}>
                                                <div 
                                                    className={`h-full ${
                                                        theme === "vs-dark"
                                                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                                            : "bg-gradient-to-r from-purple-400 to-pink-400"
                                                    } transition-all duration-300`}
                                                    style={{ width: `${opponentProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow p-4">
                            <CodeDisplay
                                targetCode={text}
                                userInput={userInput}
                                setUserInput={setUserInput}
                                calculateProgress={calculateProgress}
                                theme={theme}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Left Panel - Editor */}
                        <div className="flex-1 flex flex-col">
                            {/* Problem Info and Buttons Row */}
                            <div className={`${currentTheme.panel} p-4 flex justify-between items-start border-b ${currentTheme.border}`}>
                                <div className="flex-1 mr-4">
                                    <h2 className={`text-xl ${currentTheme.text} mb-2`}>{gameData?.title || 'Loading...'}</h2>
                                    <p className={currentTheme.textSecondary}>{gameData?.description || 'Loading problem details...'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={runCode}
                                        className={`bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors ${currentTheme.buttonHover} text-sm sm:text-base`}
                                    >
                                        Run Code
                                    </button>
                                    <div className="relative">
                                        <button 
                                            onClick={() => {
                                                if (!allTestsPassed) {
                                                    setShowTooltip(true);
                                                } else {
                                                    submitCode();
                                                }
                                            }}
                                            className={`${
                                                allTestsPassed 
                                                    ? 'bg-green-600 hover:bg-green-700' 
                                                    : 'bg-gray-400'
                                            } text-white py-2 px-4 rounded transition-colors ${currentTheme.buttonHover} text-sm sm:text-base min-w-[80px]`}
                                        >
                                            Submit
                                        </button>
                                        {showTooltip && !allTestsPassed && (
                                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg 
                                                ${currentTheme.input} ${currentTheme.text} text-sm whitespace-nowrap shadow-lg z-50
                                                animate-fade-in`}>
                                                Please run and pass all test cases first
                                                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 
                                                    ${currentTheme.input}`} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleGiveUp}
                                        className={`bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors ${currentTheme.buttonHover} text-sm sm:text-base`}
                                    >
                                        Give Up
                                    </button>
                                </div>
                            </div>

                            {/* Language Selector and Status */}
                            <div className={`${currentTheme.panel} p-2 flex justify-between items-center border-b ${currentTheme.border}`}>
                                <select
                                    className={`${currentTheme.input} px-3 py-1 rounded-lg border ${currentTheme.border}
                                    text-purple-600 focus:outline-none focus:border-purple-500 text-sm
                                    ${gameData?.gameType === 'debugging' && language !== 'python' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onChange={(e) => {
                                        if (gameData?.gameType !== 'debugging' || e.target.value === 'python') {
                                            setLanguage(e.target.value);
                                            setCode(LANGUAGE_TEMPLATES[e.target.value]);
                                        }
                                    }}
                                    value={language}
                                    disabled={gameData?.gameType === 'debugging' && language !== 'python'}
                                >
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="c">C</option>
                                </select>
                                {executionTime && (
                                    <span className={`text-sm ${currentTheme.text}`}>
                                        Execution: {executionTime.toFixed(2)}ms
                                    </span>
                                )}
                            </div>

                            {/* Editor Section */}
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    theme={theme}
                                    language={language}
                                    value={code}
                                    onChange={handleCodeChange}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        scrollbar: {
                                            vertical: 'visible',
                                            horizontal: 'visible',
                                            verticalScrollbarSize: 12,
                                            horizontalScrollbarSize: 12
                                        },
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        padding: { top: 10 },
                                        automaticLayout: true,
                                        wordWrap: 'on',
                                        readOnly: isTimeUp,
                                        contextmenu: false,
                                        copyWithSyntaxHighlighting: false,
                                        renderWhitespace: 'none',
                                        domNode: {
                                            onCopy: (e) => e.preventDefault(),
                                            onPaste: (e) => e.preventDefault(),
                                            onCut: (e) => e.preventDefault()
                                        }
                                    }}
                                    className={`${currentTheme.bg} ${currentTheme.text}`}
                                />
                            </div>
                        </div>

                        {/* Right Panel - Test Cases & Output */}
                        <div className={`w-[400px] ${currentTheme.panel} border-l ${currentTheme.border} flex flex-col`}>
                            {/* Status Message */}
                            {submissionStatus && (
                                <div className={`p-3 ${
                                    submissionStatus === 'All Tests Passed!' 
                                        ? 'bg-green-100 text-green-600 border-b border-green-300' 
                                        : submissionStatus === 'Code Executed Successfully!'
                                        ? 'bg-green-100 text-green-600 border-b border-green-300'
                                        : 'bg-red-100 text-red-600 border-b border-red-300'
                                } text-center text-sm font-semibold`}>
                                    {submissionStatus}
                                </div>
                            )}

                            {/* Test Cases */}
                            <div className="flex-1 overflow-auto p-4 max-h-[calc(100vh-200px)]">
                                <h3 className={`${currentTheme.text} font-semibold mb-4 sticky top-0 ${currentTheme.panel} py-2`}>Sample Test Cases</h3>
                                <div className="space-y-4">
                                    {gameData?.testCases?.map((testCase, index) => (
                                        <div key={index} className={`${currentTheme.input} p-4 rounded`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={currentTheme.text}>Test Case {index + 1}</h4>
                                                {testCase.passed !== undefined && (
                                                    <span className={`text-sm ${testCase.passed ? 'text-green-500' : 'text-red-500'}`}>
                                                        {testCase.passed ? '✓ Passed' : '✗ Failed'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mb-2">
                                                <span className={currentTheme.textSecondary}>Input:</span>
                                                <pre className={`mt-1 font-mono text-sm whitespace-pre-wrap break-words ${currentTheme.text}`}>{testCase.input}</pre>
                                            </div>
                                            <div>
                                                <span className={currentTheme.textSecondary}>Expected Output:</span>
                                                <pre className={`mt-1 font-mono text-sm whitespace-pre-wrap break-words ${currentTheme.text}`}>{testCase.output}</pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Output */}
                            <div className={`p-4 border-t ${currentTheme.border}`}>
                                <h3 className={`${currentTheme.text} font-semibold mb-2`}>Output</h3>
                                <pre className={`${currentTheme.input} p-3 rounded font-mono text-sm ${currentTheme.text} whitespace-pre-wrap break-words select-none`}>
                                    {output || 'No output yet'}
                                </pre>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Give Up Confirmation Dialog */}
            <Dialog 
                open={confirmGiveUp} 
                onClose={() => setConfirmGiveUp(false)}
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
                <div className={`${currentTheme.panel} p-6 rounded-lg ${currentTheme.shadow} border ${currentTheme.border} transform transition-all`}>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-red-600 mb-2">Confirm Give Up</h2>
                        <p className={currentTheme.textSecondary}>Are you sure you want to give up? This action cannot be undone.</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <button
                                onClick={confirmGiveUpAction}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                            >
                                Yes, Give Up
                            </button>
                            <button
                                onClick={() => setConfirmGiveUp(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Success/Game End Dialog */}
            <Dialog 
                open={showSuccessDialog} 
                onClose={() => setShowSuccessDialog(false)}
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
                <div className={`${currentTheme.panel} p-6 rounded-lg ${currentTheme.shadow} border ${currentTheme.border} transform transition-all`}>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-green-600 mb-2">Game Ended</h2>
                        <p className={currentTheme.textSecondary}>{winnerMessage}</p>
                        <p className="text-sm text-purple-400 mt-2">Redirecting to lobby...</p>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
