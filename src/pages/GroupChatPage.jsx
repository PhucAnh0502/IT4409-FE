import { Send, Smile, Paperclip, Phone, Video, Info } from "lucide-react";
import { useState } from "react";
import MemberListModal from "../components/MemberListModal";
import GroupMenuModal from "../components/GroupMenuModal";

const GroupChatPage = () => {
  const [showMemberList, setShowMemberList] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [groupName, setGroupName] = useState("Nhóm con trai");
  const [groupImage, setGroupImage] = useState("https://i.pravatar.cc/100?img=11");
  
  return (
    <div className="flex h-screen bg-base-200">
      {/* SIDEBAR */}
      <aside className="w-1/4 border-r border-base-300 bg-base-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-100">
          <h2 className="text-lg font-semibold text-base-content">Đoạn chat</h2>
          <button className="btn btn-sm btn-ghost text-base-content">+</button>
        </div>

        {/* Search bar */}
        <div className="p-2 bg-base-100">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="input input-bordered w-full input-sm bg-base-200 text-base-content placeholder-base-content/50"
          />
        </div>

        {/* Chat list */}
        <div className="overflow-y-auto flex-1 bg-base-100">
          {[
            { name: "Nam", message: "😎", time: "2 giờ" },
            { name: "Bình", message: "Công việc đây nhé", time: "2 giờ" },
            { name: "Nhóm con trai", message: "ok", time: "16 giờ" },
          ].map((chat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 hover:bg-base-200 cursor-pointer transition-colors"
            >
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={`https://i.pravatar.cc/50?img=${i + 1}`} alt="avatar" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-base-content">{chat.name}</p>
                <p className="text-sm text-base-content/60 truncate">
                  {chat.message} • {chat.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT AREA */}
      <section className="flex-1 flex flex-col bg-base-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-base-300 bg-base-100 p-4">
            <div className="flex items-center gap-3">
            <div 
                className="avatar cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowMemberList(true)}
            >
                <div className="w-10 rounded-full">
            <img src={groupImage} alt="group" />
                </div>
            </div>
            <div 
                onClick={() => setShowGroupMenu(!showGroupMenu)} 
                className="cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors"
            >
            <h2 className="font-semibold text-base-content">
                {groupName}
            </h2>
            <p className="text-xs text-base-content/60">Đang hoạt động</p>
            </div>
            </div>

            <div className="flex gap-3">
            <button className="btn btn-sm btn-ghost text-base-content">
                <Phone size={18} />
            </button>
            <button className="btn btn-sm btn-ghost text-base-content">
                <Video size={18} />
            </button>
            <button className="btn btn-sm btn-ghost text-base-content">
                <Info size={18} />
            </button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200">
          <div className="text-center text-xs text-base-content/40">
            Toàn đã rời khỏi nhóm
          </div>

          <div className="flex items-start gap-3">
            <div className="avatar">
              <div className="w-8 rounded-full">
                <img src="https://i.pravatar.cc/50?img=2" alt="user" />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm text-base-content">Linh</p>
              <div className="bg-base-300 text-base-content rounded-2xl p-2 px-3 mt-1 max-w-xs">
                T4 đi nhé ❤️
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="avatar">
              <div className="w-8 rounded-full">
                <img src="https://i.pravatar.cc/50?img=3" alt="user" />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm text-base-content">Hợp</p>
              <div className="bg-base-300 text-base-content rounded-2xl p-2 px-3 mt-1 max-w-xs">
                ok nhé
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-primary text-primary-content rounded-2xl p-2 px-3 max-w-xs">
              ok
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-base-300 p-3 flex items-center gap-3 bg-base-100">
          <button className="btn btn-ghost btn-sm text-base-content">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Aa"
            className="input input-bordered input-sm flex-1 rounded-full bg-base-200 text-base-content placeholder-base-content/50"
          />
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-base-content">
              <Smile size={18} />
            </button>
            <button className="btn btn-primary btn-sm">
              <Send size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Member List Modal */}
      <MemberListModal 
        isOpen={showMemberList}
        onClose={() => setShowMemberList(false)}
      />

      {/* Group Menu Modal */}
      <GroupMenuModal
        isOpen={showGroupMenu}
        onClose={() => setShowGroupMenu(false)}
        onShowMembers={() => setShowMemberList(true)}
        groupName={groupName}
        onUpdateGroupName={setGroupName}
        onUpdateGroupImage={setGroupImage}
      />
    </div>
  );
};

export default GroupChatPage;
