import React, { useState, useEffect, useContext } from 'react';
import { getFollowUps, postFollowUp } from '../api/InquiryFollowUpApi';
import { useAuth } from "../component/AuthContext.js"; //useAuth 훅 가져오기
import styles from './InquiryChat.module.css';

// This component is our "chat app"
// It just needs to know which inquiry to load
const InquiryChat = ({ inquiryId }) => {
    const [messages, setMessages] = useState([]); // The list of chat messages
    const [newMessage, setNewMessage] = useState(""); // The text in the input box
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // 1. Fetch the chat history on component load
    useEffect(() => {
        fetchMessages();
    }, [inquiryId]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await getFollowUps(inquiryId);
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to fetch chat messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle sending a new message
    const handleSend = async () => {
        console.log("handleSend called. newMessage is:", newMessage);
        if (newMessage.trim() === "") return;

        try {
            const response = await postFollowUp(inquiryId, newMessage);
            // Add the new message to our state to update the UI instantly
            setMessages([...messages, response.data]);
            setNewMessage(""); // Clear the input box
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (loading) {
        return <div>Loading chat...</div>;
    }

    console.log(user);

    if (!user) {
        return <div>Loading user session...</div>;
    }
    return (
        <div className={styles.chatContainer}>
            {/* --- This is the chat bubble area --- */}
            <div className={styles.messageList}>
                {messages.map((msg) => {
                    // Check if the author is an Admin
                    const isAdmin = msg.authorRole === 'ADMIN';
                    // Check if the author is the currently logged-in user
                    const isMe = msg.authorName === user.username;

                    // Apply CSS classes to style the bubbles left or right
                    const messageClass = isMe
                        ? styles.myMessage
                        : styles.theirMessage;

                    return (
                        <div key={msg.id} className={`${styles.messageBubble} ${messageClass}`}>
                            <div className={styles.authorName}>
                                {/* Show "Admin" or the user's name */}
                                {isAdmin ? 'Scentelier (Admin)' : msg.authorName}
                            </div>
                            <div className={styles.messageContent}>{msg.message}</div>
                            <div className={styles.timestamp}>
                                {new Date(msg.createdAt).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- This is the input box area --- */}
            <div className={styles.inputArea}>
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default InquiryChat;