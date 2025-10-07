'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Message } from './LiveChat';

interface ChatInterfaceProps {
  messages: Message[];
  inputMessage: string;
  isTyping: boolean;
  isConnected: boolean;
  onSendMessage: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
}

export function ChatInterface({
  messages,
  inputMessage,
  isTyping,
  isConnected,
  onSendMessage,
  onInputChange,
  onKeyPress,
  messagesEndRef,
  isMinimized,
  onToggleMinimize,
  onClose,
}: ChatInterfaceProps) {
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Icons.message className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
      {/* Chat header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">Live Support</h3>
        <div className="flex space-x-2">
          <button
            onClick={onToggleMinimize}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Minimize chat"
          >
            <Icons.minus className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close chat"
          >
            <Icons.x className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Icons.message className="h-10 w-10 mb-2 text-gray-300" />
            <p>Start a conversation with our support team</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender.id === 'support' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender.id === 'support'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        {isTyping && (
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={inputMessage}
            onChange={onInputChange}
            onKeyPress={onKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Icons.send className="h-4 w-4" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-1">
            Disconnected. Reconnecting...
          </p>
        )}
      </div>
    </div>
  );
}
