import React from "react";
import { X } from "lucide-react";

const ChatHeader = () => {
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={"/vite.svg"}
                alt={"Selected User Name"}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">Selected User Name</h3>
            <p className="text-sm text-base-content/70">
              Online
            </p>
          </div>
        </div>

        <button
          className="p-2 hover:bg-base-300 rounded-full transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;