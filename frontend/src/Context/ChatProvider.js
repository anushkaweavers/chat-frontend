import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  
  const socketRef = useRef(null); 
  const history = useHistory();

  // Initialize user from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) history.push("/");
  }, [history]);

  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = io(ENDPOINT, {
        transports: ["websocket"],
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Setup event listeners
      socketRef.current.emit("setup", user);
      socketRef.current.on("connected", () => setSocketConnected(true));
      socketRef.current.on("disconnect", () => setSocketConnected(false));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.removeAllListeners();
        socketRef.current = null;
        setSocketConnected(false);
      }
    };
  }, [user]);

  // Provide socket via context
  const getSocket = () => socketRef.current;

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        socket: getSocket(), // Provide current socket instance
        socketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;