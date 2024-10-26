// Context.jsx
import { createContext, useState } from "react"; // Import createContext and useState hooks from React
import runChat from "../config/gemini"; // Import runChat function from the config

// Create a Context object
export const Context = createContext();
const ContextProvider = (props) => {
    // Define state variables
	const [input, setInput] = useState(""); // To hold user input
	const [recentPrompt, setRecentPrompt] = useState(""); // To hold the most recent prompt
	const [prevPrompts, setPrevPrompts] = useState([]); // To hold a list of previous prompts
	const [showResults, setShowResults] = useState(false); // To control if results are shown
	const [loading, setLoading] = useState(false); // To indicate if data is loading
	const [resultData, setResultData] = useState(""); // To hold the result data

    // Function to update resultData with a delay for each character
	const delayPara = (index, nextWord) => {
		setTimeout(function () {
			setResultData((prev) => prev + nextWord); // Add nextWord to resultData with a delay
		}, 10 * index);
	};

    // Function to reset loading and results visibility
    const newChat = () => {
        setLoading(false); // Set loading to false
        setShowResults(false); // Hide the results
    }

    // Function to handle sending a prompt
	const onSent = async (prompt) => {
		
		setResultData(""); // Clear previous result data
		setLoading(true); // Set loading to true
		setShowResults(true); // Show the results section

        let response;
        if (prompt !== undefined) {
            response = await runChat(prompt); // Run chat with provided prompt
            setRecentPrompt(prompt); // Update recent prompt with provided prompt
        } else {
            setPrevPrompts(prev => [...prev, input]); // Add current input to previous prompts
            setRecentPrompt(input); // Update recent prompt with current input
            response = await runChat(input); // Run chat with current input
        }

		try {
            // Process the response
			let responseArray = response.split("**"); // Split response at '**' for bold formatting
            let newResponse = "";
			for (let i = 0; i < responseArray.length; i++) {
				if (i === 0 || i % 2 !== 1) {
					newResponse += responseArray[i]; // Add normal text
				} else {
					newResponse += "<b>" + responseArray[i] + "</b>"; // Add bold text
				}
			}
			let newResponse2 = newResponse.split("*").join("<br/>"); // Replace '*' with line breaks
			let newResponseArray = newResponse2.split(""); // Split response into individual characters
			for (let i = 0; i < newResponseArray.length; i++) {
				const nextWord = newResponseArray[i];
				delayPara(i, nextWord + ""); // Display each character with delay
			}
		} catch (error) {
			console.error("Error while running chat:", error); // Log any errors
		} finally {
			setLoading(false); // Set loading to false
			setInput(""); // Clear the input field
		}
	};

    // Context value to be provided to children components
	const contextValue = {
		prevPrompts, // List of previous prompts
		setPrevPrompts, // Function to update previous prompts
		onSent, // Function to handle sending a prompt
		setRecentPrompt, // Function to update the most recent prompt
		recentPrompt, // The most recent prompt
		input, // The current user input
		setInput, // Function to update user input
		showResults, // Boolean to control result visibility
		loading, // Boolean to indicate loading status
		resultData, // The result data to display
		newChat, // Function to reset chat
	};

    // Provide the context value to children components
	return (
		<Context.Provider value={contextValue}>{props.children}</Context.Provider>
	);
};

export default ContextProvider;