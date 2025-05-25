import React, { useState } from "react";
import axios from "axios";

const ChallengeForm = ({ category, onSave, editChallenge, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    points: 0,
    timeLimit: 30,
    memoryLimit: 256,
    inputFormat: "Standard input",
    outputFormat: "Standard output",
    sampleInput: "",
    sampleOutput: "",
    testCases: [],
    buggyCode: "",
    correctCode: "",
    bugDescription: "",
    solutionExplanation: "",
    codeFile: null,
    ...(editChallenge || {})
  });

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [
        ...formData.testCases,
        { 
          input: "", 
          output: "", 
          isHidden: false
        },
      ],
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      testCases: newTestCases,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Validate required fields
    if (!formData.title || !formData.description || !formData.difficulty || !formData.points) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate debugging-specific fields
    if (category === "Debugging") {
      if (!formData.buggyCode || !formData.correctCode || !formData.bugDescription || !formData.solutionExplanation) {
        alert("Please fill in all required debugging fields");
        return;
      }
    }

    // Validate test cases
    if ((category === "Contest" || category === "Debugging") && formData.testCases.length === 0) {
      alert("Please add at least one test case");
      return;
    }

    // Validate file upload for Contest and FlashCode only
    if (category === "Contest" && !formData.codeFile) {
      alert("Please upload a program file for Contest challenges");
      return;
    }

    if (category === "FlashCode" && !formData.codeFile) {
      alert("Please upload a program file for FlashCode challenges");
      return;
    }

    // Add common fields
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("difficulty", formData.difficulty);
    formDataToSend.append("points", formData.points);

    // Add category-specific fields
    if (category === "Contest") {
      formDataToSend.append("timeLimit", formData.timeLimit || 30);
      formDataToSend.append("memoryLimit", formData.memoryLimit || 256);
      formDataToSend.append("inputFormat", formData.inputFormat || "Standard input");
      formDataToSend.append("outputFormat", formData.outputFormat || "Standard output");
      formDataToSend.append("sampleInput", formData.sampleInput || "");
      formDataToSend.append("sampleOutput", formData.sampleOutput || "");
      if (formData.testCases) {
        formDataToSend.append("testCases", JSON.stringify(formData.testCases));
      }
      if (formData.codeFile) {
        formDataToSend.append("codeFile", formData.codeFile);
      }
    } else if (category === "Debugging") {
      formDataToSend.append("buggyCode", formData.buggyCode);
      formDataToSend.append("correctCode", formData.correctCode);
      formDataToSend.append("bugDescription", formData.bugDescription);
      formDataToSend.append("solutionExplanation", formData.solutionExplanation);
      if (formData.testCases) {
        // Format test cases for debugging challenges
        const formattedTestCases = formData.testCases.map(testCase => ({
          input: testCase.input,
          output: testCase.output,
          isHidden: testCase.isHidden
        }));
        formDataToSend.append("testCases", JSON.stringify(formattedTestCases));
      }
    } else if (category === "FlashCode") {
      formDataToSend.append("timeLimit", formData.timeLimit || 30);
      if (formData.codeFile) {
        formDataToSend.append("codeFile", formData.codeFile);
      }
    }

    try {
      if (editChallenge) {
        await axios.put(`http://localhost:5000/api/challenges/${category}/${editChallenge._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Challenge updated successfully!");
      } else {
        await axios.post(`http://localhost:5000/api/challenges/${category}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Challenge created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving challenge:", error);
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         "Error saving challenge. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <div className="fixed top-16 inset-x-0 flex items-start justify-center bg-gray-900 bg-opacity-50 z-[9999] min-h-[calc(100vh-4rem)]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[calc(100vh-6rem)] overflow-y-auto relative my-8">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {editChallenge ? "Edit" : "Add"} {category} Challenge
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields for all categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter challenge title"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                name="difficulty"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                name="points"
                placeholder="Enter points"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.points}
                onChange={handleChange}
              />
            </div>

            {category === "FlashCode" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
                <input
                  type="number"
                  name="timeLimit"
                  placeholder="Enter time limit"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.timeLimit}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Enter challenge description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Program File Upload - Only for Contest and FlashCode */}
          {(category === "Contest" || category === "FlashCode") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program File</label>
              <input 
                type="file" 
                name="codeFile" 
                accept=".txt,.js,.json,.xml,.py,.java,.cpp,.c,.cs,.rb,.php,.go,.rs,.swift,.kt,.scala,.r,.m,.sql,.sh"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                onChange={handleChange} 
              />
              <p className="mt-1 text-sm text-gray-500">
                Accepted file types: Text files, JavaScript, Python, Java, C++, C, C#, Ruby, PHP, Go, Rust, Swift, Kotlin, Scala, R, MATLAB, SQL, Shell scripts
              </p>
            </div>
          )}

          {/* Debugging-specific fields */}
          {category === "Debugging" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buggy Code</label>
                <textarea
                  name="buggyCode"
                  placeholder="Enter the code with bugs"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  value={formData.buggyCode}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Code</label>
                <textarea
                  name="correctCode"
                  placeholder="Enter the correct code"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  value={formData.correctCode}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bug Description</label>
                <textarea
                  name="bugDescription"
                  placeholder="Describe the bugs in the code"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  value={formData.bugDescription}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solution Explanation</label>
                <textarea
                  name="solutionExplanation"
                  placeholder="Explain how to fix the bugs"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  value={formData.solutionExplanation}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Test Cases Section - Only for Contest and Debugging */}
          {(category === "Contest" || category === "Debugging") && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Test Cases</h3>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Add Test Case
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.testCases.map((testCase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700">Test Case {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newTestCases = formData.testCases.filter((_, i) => i !== index);
                          setFormData({ ...formData, testCases: newTestCases });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                        <textarea
                          placeholder="Enter test case input"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="2"
                          value={testCase.input}
                          onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                        <textarea
                          placeholder="Enter expected output"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="2"
                          value={testCase.output}
                          onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={testCase.isHidden}
                          onChange={(e) => handleTestCaseChange(index, "isHidden", e.target.checked)}
                          className="rounded text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Hidden Test Case</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {editChallenge ? "Update Challenge" : "Create Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm;