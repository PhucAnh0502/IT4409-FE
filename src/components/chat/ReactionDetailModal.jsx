import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { reactions as reactionConstants } from "../../constants";

const ReactionDetailModal = ({ isOpen, onClose, messageReactions }) => {
  const [activeTab, setActiveTab] = useState("all");

  const existingReactionTypes = useMemo(() => {
    const types = Array.from(new Set(messageReactions.map((r) => r.reactionType)));
    return reactionConstants.filter((r) => types.includes(r.value));
  }, [messageReactions]);

  const filteredReactions = useMemo(() => {
    if (activeTab === "all") return messageReactions;
    return messageReactions.filter((r) => r.reactionType === activeTab);
  }, [activeTab, messageReactions]);

  if (!isOpen) return null;if (!isOpen) return null;

  const getCount = (type) => {
    return messageReactions.filter((r) => r.reactionType === type).length;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose} 
    >
      <div 
        className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="text-lg font-bold text-center flex-1">Reactions to message</h3>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs  */}
        <div className="flex px-4 border-b border-base-300 overflow-x-auto no-scrollbar gap-2">
          {/* Tab "Tất cả" */}
          <button 
            onClick={() => setActiveTab("all")}
            className={`py-3 px-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === "all" 
                ? "border-primary text-primary" 
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            Tất cả ({messageReactions.length})
          </button>

          {/* Render các tab icon cụ thể */}
          {existingReactionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveTab(type.value)}
              className={`py-3 px-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${
                activeTab === type.value 
                  ? "border-primary text-primary" 
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <span className="text-lg">{type.label}</span>
              <span>{getCount(type.value)}</span>
            </button>
          ))}
        </div>

        {/* List Users */}
        <div className="max-h-[400px] min-h-[200px] overflow-y-auto p-2 custom-scrollbar">
          {filteredReactions.length > 0 ? (
            filteredReactions.map((item, index) => {
              const reactionIcon = reactionConstants.find(r => r.value === item.reactionType)?.label;
              
              return (
                <div 
                  key={`${item.userId}-${index}`} 
                  className="flex items-center justify-between p-3 hover:bg-base-200 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-bold text-sm">{item.userName || "Người dùng"}</div>
                    </div>
                  </div>
                  
                  <span className="text-2xl drop-shadow-sm">{reactionIcon}</span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <p>No reactions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionDetailModal;