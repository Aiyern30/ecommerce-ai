"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useState, useEffect, useRef } from "react";
import ChatWindow from "./Chat/ChatWindow";
import ChatButton from "./Chat/ChatButton";
import { Toaster } from "./ui";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatOpen) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
        setIsExpanded(false);
      }
    }

    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
        <Toaster />
      </main>
      <div className="fixed bottom-0 right-0 z-50 flex items-end p-4">
        {isChatOpen && (
          <div ref={chatRef}>
            <ChatWindow
              isExpanded={isExpanded}
              onClose={toggleChat}
              onExpand={toggleExpand}
            />
          </div>
        )}
        {!isChatOpen && <ChatButton onClick={toggleChat} />}
      </div>
      <Footer />
    </div>
  );
}
