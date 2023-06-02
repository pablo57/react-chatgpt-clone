import { useState } from "react";
import "./App.css";

type Message = { role: string; content: string };

const App = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [previousChats, setPreviousChats] = useState<
    { title: string; role: string; content: string }[]
  >([]);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const getMessages = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    const input = inputValue.trim();

    try {
      const options = {
        method: "POST",
        body: JSON.stringify({
          messages: [
            ...previousChats
              .filter((previousChat) => previousChat.title === currentTitle)
              .map((previousChat) => ({
                role: previousChat.role,
                content: previousChat.content,
              })),
            { role: "user", content: input },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      const data = await response.json();
      const responseMessage = data.choices[0].message;

      processNewMessage(responseMessage);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const processNewMessage = (newMessage: Message) => {
    // Set the title if it has not been set yet.
    if (!currentTitle) {
      setCurrentTitle(inputValue);
    }

    setPreviousChats((prevChats) => [
      ...prevChats,
      // Save user prompt as part of previous chats
      {
        title: currentTitle || inputValue,
        role: "user",
        content: inputValue,
      },
      // Save openai response as part of previous chats
      {
        title: currentTitle || inputValue,
        role: newMessage.role,
        content: newMessage.content,
      },
    ]);

    // Clear input value
    setInputValue("");
  };

  const createNewChat = () => {
    setInputValue("");
    setCurrentTitle("");
  };

  const handleSelectChatClick = (title: string) => {
    setCurrentTitle(title);
    setInputValue("");
  };

  const currentChat = previousChats.filter(
    (previousChat) => previousChat.title === currentTitle
  );
  const uniqueTitles = Array.from(
    previousChats.reduce((accumulator, prevChat) => {
      return accumulator.add(prevChat.title);
    }, new Set<string>())
  );

  console.log({ uniqueTitles, previousChats, currentTitle, currentChat });

  return (
    <div className="app">
      <aside className="side-bar">
        <button className="create-chat-btn" onClick={createNewChat}>
          + New Chat
        </button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleSelectChatClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
        <nav>
          <p>Made by Pablo</p>
        </nav>
      </aside>

      <main className="main">
        {!currentTitle && <h1>PabloGPT</h1>}
        <ul className="feed">
          {currentChat?.map((chat, index) => (
            <li key={index}>
              <p className="role">{chat.role}</p>
              <p>{chat.content}</p>
            </li>
          ))}
        </ul>

        <div className="bottom-section">
          {isLoading && <p>Loading...</p>}
          <div className="input-container">
            <input
              id="main-input"
              value={inputValue}
              disabled={isLoading}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  getMessages();
                }
              }}
            />
            <button id="submit-btn" disabled={isLoading} onClick={getMessages}>
              &#10146;
            </button>
          </div>
          <p className="info">
            Chat GPT Mar 14 Version. Free Research Preview. Our goal is to make
            AI systems more natural and safe to interact with. Your feedback
            will help us improve.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
