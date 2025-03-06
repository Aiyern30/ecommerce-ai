export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 flex items-center space-x-1">
        <div
          className="w-2 h-2 rounded-full bg-current animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-current animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 rounded-full bg-current animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
}
