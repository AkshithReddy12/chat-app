import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';  // Correct import
import MessageList from './components/MessageList';
import './style.css';

const socket = io('http://localhost:5000');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/messages')
      .then(response => response.json())
      .then(data => setMessages(data));
  }, []);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = () => {
    if (!senderName || !messageContent) {
      alert('Please provide both a sender and message content');
      return;
    }

    const newMessage = { sender: senderName, content: messageContent };
    socket.emit('sendMessage', newMessage);
    setMessageContent('');
  };

  return (
    <div className="chat-container">
      <h1>Real-time Chat</h1>

      <div className="chat-messages">
        <MessageList messages={messages} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="Your name"
        />
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type your message"
        ></textarea>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
