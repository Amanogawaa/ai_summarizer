import { writable } from 'svelte/store';

// Create a store for the chatbot's open/closed state
export const isChatbotOpen = writable(false);

// Function to toggle the chatbot's state
export function toggleChatbot() {
    isChatbotOpen.update(state => !state);
}

// Function to open the chatbot
export function openChatbot() {
    isChatbotOpen.set(true);
}

// Function to close the chatbot
export function closeChatbot() {
    isChatbotOpen.set(false);
} 