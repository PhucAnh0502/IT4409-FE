import React from "react";

const MessageContainerSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <div className="p-4 border-b border-base-300 flex items-center gap-3">
        <div className="skeleton size-10 rounded-full bg-base-300 shrink-0" />
        <div className="flex flex-col gap-1">
          <div className="skeleton h-4 w-32 bg-base-300" />
          <div className="skeleton h-3 w-16 bg-base-300" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {skeletonMessages.map((_, idx) => (
          <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
            {idx % 2 === 0 && (
              <div className="chat-image avatar">
                <div className="skeleton size-10 rounded-full bg-base-300" />
              </div>
            )}

            <div className="chat-bubble !bg-transparent p-0">
              {[1, 3].includes(idx) ? (
                <div className="skeleton size-48 rounded-lg bg-base-300" />
              ) : (
                <div
                  className={`skeleton h-10 rounded-xl bg-base-300`}
                  style={{
                    width: `${Math.floor(Math.random() * 150) + 100}px`,
                    height: Math.random() > 0.5 ? '40px' : '64px'
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-base-300">
        <div className="skeleton h-12 w-full rounded-full bg-base-300" />
      </div>
    </div>
  );
};

export default MessageContainerSkeleton;