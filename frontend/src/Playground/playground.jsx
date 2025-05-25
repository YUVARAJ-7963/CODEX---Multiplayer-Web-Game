import { useState, useEffect } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { Dialog } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactConfetti from 'react-confetti';

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
const CodeDisplay = ({ targetCode, userInput, setUserInput, calculateProgress }) => {
    const [isReading, setIsReading] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);

    const renderCharacter = (char, index) => {
        if (isReading) {
            return <span key={index} className="text-white">{char}</span>;
        }

        if (index >= userInput.length) {
            return <span key={index} className="text-gray-400">{char}</span>;
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
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-500/20 px-4 py-2 rounded-lg">
                            <span className="text-purple-400 text-lg font-mono">
                                {calculateProgress()}%
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-400">Correct</span>
                        <div className="w-3 h-3 rounded-full bg-red-500 ml-4"></div>
                        <span className="text-sm text-gray-400">Incorrect</span>
                    </div>
                </div>
                
                <div className="bg-[#1E1E1E] p-6 rounded-xl border border-purple-500/30 shadow-lg relative">
                    <pre className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
                        {targetCode.split('').map((char, index) => renderCharacter(char, index))}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default function Playground() {
    const location = useLocation();
    const navigate = useNavigate();

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

    // Add calculateProgress function here
    const calculateProgress = () => {
        if (!userInput || !text) return 0;
        
        let correctChars = 0;
        let totalChars = text.length;
        
        // Compare each character exactly
        for (let i = 0; i < userInput.length && i < text.length; i++) {
            if (userInput[i] === text[i]) {
                correctChars++;
            }
        }

        // Return 100% only if the strings match exactly
        if (userInput === text) {
            return 100;
        }
        
        return Math.round((correctChars / totalChars) * 100);
    };

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

    const [language, setLanguage] = useState(() => {
        console.log('Initializing language state');
        console.log('Location state:', location.state);
        if (location.state?.gameType === 'debugging' && location.state?.buggycode) {
            const detectedLang = detectLanguage(location.state.buggycode);
            console.log('Initial language set to:', detectedLang);
            return detectedLang;
        }
        console.log('Defaulting to Python');
        return 'python';
    });

    const [code, setCode] = useState(() => {
        console.log('Initializing code state');
        if (location.state?.gameType === 'debugging' && location.state?.buggycode) {
            console.log('Setting initial code from buggycode');
            return location.state.buggycode;
        }
        console.log('Setting initial code from template');
        return LANGUAGE_TEMPLATES[language];
    });

    const [output, setOutput] = useState("");
    const [theme, setTheme] = useState("vs-dark");
    const [points, setPoints] = useState(location.state?.points || 100);
    const [userData, setUserData] = useState({
        username: location.state?.username || '',
        uid: location.state?.uid || ''
    });

    // Add debug logging for location state
    useEffect(() => {
        console.log('Playground location state:', location.state);
        console.log('Current code state:', code);
        console.log('Current language state:', language);
    }, [location.state, code, language]);

    // Update code and language when location state changes
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

    // Fetch user data if not available from location state
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userData.username || !userData.uid) {
                try {
                    const token = localStorage.getItem('userToken');
                    console.log('Token from localStorage:', token); // Debug log
                    
                    if (!token) {
                        console.log('No token found in localStorage');
                        navigate('/lobby'); // Redirect to lobby if no token
                        return;
                    }
                     
                    console.log('Making request to /api/users/profile with token');
                    const response = await axios.get('http://localhost:5000/api/profile', {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log('Profile response:', response.data); // Debug log
                    
                    if (response.data) {
                        setUserData({
                            username: response.data.username || 'Anonymous',
                            uid: response.data.UID || 'N/A'
                        });
                    } else {
                        console.log('No user data in response');
                        navigate('/lobby'); // Redirect to lobby if no user data
                    }
                } catch (error) {
                    console.error('Error fetching user data in playground:', error);
                    if (error.response?.status === 401) {
                        // Token is invalid or expired
                        localStorage.removeItem('userToken');
                        navigate('/lobby');
                    }
                }
            }
        };

        fetchUserData();
    }, [userData.username, userData.uid, navigate]);

    const [timer, setTimer] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [confirmGiveUp, setConfirmGiveUp] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [executionTime, setExecutionTime] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Security check
    useEffect(() => {
        const state = location.state;
        if (!state || (!state.from && !state.gameMode)) {
            navigate('/lobby');
            return;
        }

        // Set problem details from the level data
        if (state.level) {
            setProblemDetails(state.level);
        }
    }, [location, navigate]);

    const [problemDetails, setProblemDetails] = useState({
        title: "Loading...",
        description: "Loading problem details...",
        testCases: [],
        points: 0
    });

    // Start Timer when user types
    useEffect(() => {
        let interval;
        if (isTyping) {
            interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTyping]);

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

    // Handle confetti cleanup
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    // Add debug logging for state changes
    useEffect(() => {
        console.log('Language state changed to:', language);
    }, [language]);

    useEffect(() => {
        console.log('Code state changed to:', code);
    }, [code]);

    const executeCodeWithPiston = async (code, input = "") => {
        setIsLoading(true);
        try {
            // Format the code based on language
            let formattedCode = code;
            
            // Handle input for different languages
            console.log('Language:', language);
            if (language === "python") {
                // For Python, modify the code to use sys.stdin instead of input()
                formattedCode = code.replace(
                    /input\([^)]*\)/g,
                    "sys.stdin.readline().strip()"
                );
                // Add sys import if not present
                if (!formattedCode.includes("import sys")) {
                    formattedCode = "import sys\n" + formattedCode;
                }
            } else if (language === "java") {
                // For Java, wrap the code in a class and use Scanner for input
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
            } else if (language === "cpp") {
                // For C++, we'll use the code as is since it's already properly formatted
                formattedCode = code;
            } else if (language === "c") {
                // For C, use scanf for input and add proper includes
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

            // Handle different response formats and clean up output
            let output = response.data.run?.stdout || response.data.stdout || "";
            const error = response.data.run?.stderr || response.data.stderr || null;

            // Clean up output based on language
            if (language === "java") {
                // Remove Java specific output
                output = output.replace(/^Picked up .*\n/gm, "");
            }

            // If there's an error, include it in the output
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

    const [allTestsPassed, setAllTestsPassed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Add tooltip timeout cleanup
    useEffect(() => {
        if (showTooltip) {
            const timer = setTimeout(() => {
                setShowTooltip(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showTooltip]);

    // Update the runCode function to check test case status
    const runCode = async () => {
        setIsLoading(true);
        try {
            let testResults = [];
            const testCases = location.state?.testCases || [];
            
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
                
                // Format test results with more detail
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
                
                // Add summary at the end
                const passedTests = testResults.filter(r => r.passed).length;
                const totalTests = testResults.length;
                const summaryText = `\nSummary:\n${passedTests} out of ${totalTests} tests passed.`;
                
                setOutput(resultsText + summaryText);
                setExecutionTime(testResults.reduce((sum, r) => sum + r.executionTime, 0));
                
                // Update test case status
                location.state.testCases = location.state.testCases.map((testCase, index) => ({
                    ...testCase,
                    passed: testResults[index]?.passed || false
                }));

                // Check if all tests passed and show celebration
                const allTestsPassed = testResults.every(result => result.passed);
                if (allTestsPassed) {
                    setSubmissionStatus('All Tests Passed!');
                    setIsLoading(false);
                    setShowConfetti(true);
                    
                    // Clear the success message after 3 seconds
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
                // If no test cases, run with empty input
                const startTime = performance.now();
                const pistonResult = await executeCodeWithPiston(code, "");
                const endTime = performance.now();
                setExecutionTime(endTime - startTime);
                setOutput(pistonResult.output);
                
                // Show celebration for successful execution without test cases
                setSubmissionStatus('Code Executed Successfully!');
                setIsLoading(false);
                setShowConfetti(true);
                
                // Clear the success message after 3 seconds
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

    const confirmGiveUpAction = () => {
        setCode(""); // Clear code
        setPoints(points - 20); // Deduct points for giving up
        setConfirmGiveUp(false);
        alert("You have given up! Try again next time.");
    };

    const toggleTheme = () => {
        setTheme(theme === "vs-dark" ? "light" : "vs-dark");
    };

    // Disable Copy-Paste but allow Undo-Redo
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "c")) {
                e.preventDefault();
            }
        };

        const handlePaste = (e) => {
            e.preventDefault();
        };

        const handleCopy = (e) => {
            e.preventDefault();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("copy", handleCopy);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("copy", handleCopy);
        };
    }, []);

    const submitCode = async () => {
        // Check for 80% accuracy only for flashcode
        if (location.state?.gameType === 'flashcode') {
            const currentProgress = calculateProgress();
            if (currentProgress < 80) {
                alert("You need to achieve at least 80% accuracy to submit!");
                return;
            }
        }

        setIsLoading(true);
        try {
            // Check if level is already completed using the new endpoint
            const checkResponse = await axios.get(`http://localhost:5000/api/user/check-level`, {
                params: {
                    uid: userData.uid,
                    gameType: location.state?.gameType,
                    level: location.state?.level?.level
                }
            });
            
            const isLevelCompleted = checkResponse.data.isCompleted;
            
            // Calculate points based on completion status
            const originalPoints = location.state?.level?.points || 100;
            const actualPoints = isLevelCompleted ? Math.floor(originalPoints / 4) : originalPoints;

            // Update user scores with adjusted points
            try {
                const updateResponse = await axios.post('http://localhost:5000/api/user/update-scores', {
                    gameType: location.state?.gameType,
                    points: actualPoints,
                    level: location.state?.level?.level,
                    uid: userData.uid
                });
                
                if (updateResponse.data.success) {
                    console.log('Scores updated successfully');
                    setSuccessMessage(`Congratulations! You earned ${actualPoints} points${isLevelCompleted ? ' (replay)' : ''}!`);
                    setShowSuccessDialog(true);
                    // Navigate after 2 seconds
                    setTimeout(() => {
                        navigate('/lobby');
                    }, 4000);
                }
            } catch (error) {
                console.error('Error updating scores:', error);
                setSuccessMessage('Error updating scores. Please try again.');
                setShowSuccessDialog(true);
            }
        } catch (error) {
            console.error('Error checking level completion:', error);
            setSubmissionStatus('Error during submission');
        } finally {
            setIsLoading(false);
        }
    };

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
        }
    };

    const currentTheme = theme === "vs-dark" ? themeStyles.dark : themeStyles.light;

    // Loading animation component
    const LoadingSpinner = () => (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
            <div className="relative w-16 h-16">
                <div className="absolute w-16 h-16 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    const [userInput, setUserInput] = useState('');
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [showCodeDisplay, setShowCodeDisplay] = useState(false);
    const [text, setText] = useState('');  // New state for FlashCode text

    // Update effect to handle FlashCode initialization
    useEffect(() => {
        console.log('Location state changed:', location.state);
        if (location.state?.gameType === 'flashcode') {
            console.log('FlashCode detected, checking codeFile:', location.state?.codeFile);
            if (location.state?.codeFile) {
                console.log('FlashCode Content:', {
                    codeFile: location.state.codeFile,
                    gameType: location.state.gameType,
                    fullState: location.state
                });
                setShowCodeDisplay(true);
                setText(location.state.codeFile);
            } else {
                console.log('No codeFile found in state');
            }
        }
    }, [location.state]);


    return (
        <div className={`h-screen ${currentTheme.bg} ${currentTheme.text} flex flex-col relative overflow-hidden select-none`}>
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
            <header className={`p-3 ${currentTheme.header} border-b ${currentTheme.border} flex justify-between items-center ${currentTheme.shadow}`}>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        CODEX
                    </h1>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-purple-400">
                            {location.state?.gameType?.charAt(0).toUpperCase() + location.state?.gameType?.slice(1) || 'Practice'}
                        </h2>
                        <span className="text-sm text-purple-400">
                            {location.state?.gameMode === 'pvp' ? 'Battle Mode' : 'Practice Mode'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-purple-500">Player:</span>
                        <span className="font-mono">{userData.username || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-500">UID:</span>
                        <span className="font-mono">{userData.uid || 'N/A'}</span>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className={`px-3 py-1 rounded-lg ${currentTheme.input} ${currentTheme.buttonHover} transition-colors
                        border ${currentTheme.border}`}
                    >
                        {theme === "vs-dark" ? "🌞" : "🌙"}
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-500">Score:</span>
                        <span className="font-mono">{problemDetails.points}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-grow overflow-hidden">
                {location.state?.gameType === 'flashcode' ? (
                    <div className="w-full flex flex-col overflow-y-auto select-none">
                        <div className={`p-4 ${currentTheme.panel} sticky top-0 z-10`}>
                            <h2 className="text-xl font-bold mb-2 text-purple-600">{problemDetails.title}</h2>
                            <p className={currentTheme.textSecondary}>{problemDetails.description}</p>
                        </div>
                        <div className="flex-grow p-4">
                            <CodeDisplay
                                targetCode={text}
                                userInput={userInput}
                                setUserInput={setUserInput}
                                calculateProgress={calculateProgress}
                            />
                            <div className="mt-4 flex justify-center">
                                <button 
                                    onClick={submitCode}
                                    className="px-8 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition-all
                                    shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]
                                    text-white text-sm"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Original layout for other game types
                    <>
                        {/* Left Panel */}
                        <div className={`w-2/3 border-r ${currentTheme.border} flex flex-col select-none`}>
                            <div className={`p-4 ${currentTheme.panel}`}>
                                <h2 className="text-xl font-bold mb-2 text-purple-600">{problemDetails.title}</h2>
                                <p className={currentTheme.textSecondary}>{problemDetails.description}</p>
                            </div>

                            <div className="flex-grow">
                                <div className={`${currentTheme.panel} p-2 flex items-center gap-4 border-y ${currentTheme.border}`}>
                                    <select
                                        className={`${currentTheme.input} px-3 py-1 rounded-lg border ${currentTheme.border}
                                        text-purple-600 focus:outline-none focus:border-purple-500 text-sm
                                        ${location.state?.gameType === 'debugging' && language !== 'python' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onChange={(e) => {
                                            if (location.state?.gameType !== 'debugging' || e.target.value === 'python') {
                                                console.log('Language changed to:', e.target.value);
                                                setLanguage(e.target.value);
                                                setCode(LANGUAGE_TEMPLATES[e.target.value]);
                                            }
                                        }}
                                        value={language}
                                        disabled={location.state?.gameType === 'debugging' && language !== 'python'}
                                    >
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="c">C</option>
                                    </select>
                                    {executionTime && (
                                        <span className="text-purple-500 text-sm">
                                            Execution: {executionTime.toFixed(2)}ms
                                        </span>
                                    )}
                                </div>
                                <Editor
                                    height="calc(100vh - 120px)"
                                    theme={theme}
                                    language={language}
                                    value={code}
                                    onChange={(newCode) => {
                                        if (location.state?.gameType === 'flashcode') {
                                            setUserInput(newCode);
                                        }
                                        setCode(newCode);
                                        if (!isTyping) setIsTyping(true);
                                    }}
                                    options={{
                                        fontSize: 16,
                                        minimap: { enabled: false },
                                        padding: { top: 20 },
                                        scrollbar: {
                                            vertical: 'visible',
                                            horizontal: 'visible',
                                            verticalScrollbarSize: 12,
                                            horizontalScrollbarSize: 12
                                        },
                                        lineNumbers: 'on',
                                        roundedSelection: true,
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
                                />
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className={`w-1/3 flex flex-col overflow-hidden select-none`}>
                            <div className={`p-4 ${currentTheme.panel} border-b ${currentTheme.border}`}>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={runCode}
                                        className={`bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors ${currentTheme.buttonHover}`}
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
                                            } text-white py-2 px-4 rounded transition-colors ${currentTheme.buttonHover}`}
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
                                    {location.state?.gameMode === 'pvp' && (
                                        <button
                                            onClick={confirmGiveUpAction}
                                            className={`bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors ${currentTheme.buttonHover}`}
                                        >
                                            Give Up
                                        </button>
                                    )}
                                </div>
                            </div>

                            {submissionStatus && (
                                <div className={`p-3 ${
                                    submissionStatus === 'All Tests Passed!' 
                                        ? 'bg-green-100 text-green-600 border-b border-green-300' 
                                        : 'bg-red-100 text-red-600 border-b border-red-300'
                                } text-center text-sm font-semibold`}>
                                    {submissionStatus}
                                </div>
                            )}

                            <div className="flex-grow flex flex-col overflow-hidden">
                                {(location.state?.gameType === 'contest' || location.state?.gameType === 'debug' || location.state?.gameType === 'debugging') && (
                                    <div className={`p-4 ${currentTheme.panel} border-b ${currentTheme.border} h-max overflow-y-auto`}>
                                        <h3 className="font-semibold mb-2 text-purple-600 text-sm sticky top-0 bg-inherit">Sample Test Cases</h3>
                                        {location.state?.testCases?.map((testCase, index) => (
                                            <div key={index} className={`${currentTheme.input} p-3 rounded-lg border ${currentTheme.border} mb-2`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-purple-500 text-sm">Test Case {index + 1}</span>
                                                    {testCase.passed !== undefined && (
                                                        <span className={`text-sm ${testCase.passed ? 'text-green-500' : 'text-red-500'}`}>
                                                            {testCase.passed ? '✓ Passed' : '✗ Failed'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mb-2">
                                                    <span className="text-purple-500 text-sm">Input:</span>
                                                    <pre className={`font-mono mt-1 ${currentTheme.text} text-sm`}>{testCase.input}</pre>
                                                </div>
                                                <div>
                                                    <span className="text-purple-500 text-sm">Expected Output:</span>
                                                    <pre className={`font-mono mt-1 ${currentTheme.text} text-sm`}>{testCase.output}</pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={`p-4 ${currentTheme.panel} flex-grow overflow-y-auto`}>
                                    <h3 className="font-semibold mb-2 text-purple-600 text-sm sticky top-0 bg-inherit">Output</h3>
                                    <pre className={`${currentTheme.input} p-3 rounded-lg font-mono ${currentTheme.text} text-sm
                                        border ${currentTheme.border} whitespace-pre-wrap`}>
                                        {output || 'No output yet'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Dialog with theme support */}
            <Dialog 
                open={confirmGiveUp} 
                onClose={() => setConfirmGiveUp(false)} 
                className="fixed inset-0 flex items-center justify-center bg-black/50"
            >
                <div className={`${currentTheme.panel} p-6 rounded-lg ${currentTheme.shadow} border ${currentTheme.border}`}>
                    <h2 className="text-xl font-bold text-purple-600">Are you sure?</h2>
                    <p className={currentTheme.textSecondary}>You will lose 20 points if you give up.</p>
                    <div className="mt-4 flex gap-4">
                        <button 
                            onClick={confirmGiveUpAction} 
                            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors text-white"
                        >
                            Yes
                        </button>
                        <button 
                            onClick={() => setConfirmGiveUp(false)} 
                            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition-colors text-white"
                        >
                            No
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* Success Dialog */}
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
                        <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
                        <p className={currentTheme.textSecondary}>{successMessage}</p>
                        <p className="text-sm text-purple-400 mt-2">Redirecting to lobby...</p>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
