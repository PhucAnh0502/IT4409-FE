import React from "react";
import { Users } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input type="checkbox" className="checkbox checkbox-sm" />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">(2 online)</span>
        </div>
      </div>

      {/* Danh sách người dùng */}
      <div className="overflow-y-auto w-full py-3">
        <button
          className={`
            w-full p-3 flex items-center gap-3
            hover:bg-base-300 transition-colors
            bg-base-300 ring-1 ring-base-300 /* Class cho trạng thái "selected" */
          `}
        >
          <div className="relative mx-auto lg:mx-0">
            <img
              src={"/vite.svg"}
              alt={"Alice Smith"}
              className="size-12 object-cover rounded-full"
            />

            <span
              className="absolute bottom-0 right-0 size-3 bg-green-500 
                rounded-full ring-1 ring-zinc-900"
            />
          </div>

          <div className="hidden lg:block text-left min-w-0">
            <div className="font-medium truncate">Alice Smith</div>
            <div className="text-sm text-zinc-400">Online</div>
          </div>
        </button>

        <button
          className={`
            w-full p-3 flex items-center gap-3
            hover:bg-base-300 transition-colors
          `}
        >
          <div className="relative mx-auto lg:mx-0">
            <img
              src={"/vite.svg"}
              alt={"Bob Johnson"}
              className="size-12 object-cover rounded-full"
            />
          </div>

          <div className="hidden lg:block text-left min-w-0">
            <div className="font-medium truncate">Bob Johnson</div>
            <div className="text-sm text-zinc-400">Offline</div>
          </div>
        </button>

        <button
          className={`
            w-full p-3 flex items-center gap-3
            hover:bg-base-300 transition-colors
          `}
        >
          <div className="relative mx-auto lg:mx-0">
            <img
              src={"/vite.svg"}
              alt={"Charlie Brown"}
              className="size-12 object-cover rounded-full"
            />
            <span
              className="absolute bottom-0 right-0 size-3 bg-green-500 
                rounded-full ring-1 ring-zinc-900"
            />
          </div>

          <div className="hidden lg:block text-left min-w-0">
            <div className="font-medium truncate">Charlie Brown</div>
            <div className="text-sm text-zinc-400">Online</div>
          </div>
        </button>

        {/*
        <div className="text-center text-zinc-500 py-4">
          No online users
        </div>
        */}
      </div>
    </aside>
  );
};
export default Sidebar;
