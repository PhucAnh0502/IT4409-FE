import React, { useState, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { reactions as reactionConstants } from "../../constants";

const ReactionDetailModal = ({ isOpen, onClose, messageReactions }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef({});

  const existingReactionTypes = useMemo(() => {
    const types = Array.from(new Set(messageReactions.map((r) => r.reactionType)));
    return reactionConstants.filter((r) => types.includes(r.value));
  }, [messageReactions]);

  const filteredReactions = useMemo(() => {
    if (activeTab === "all") return messageReactions;
    return messageReactions.filter((r) => r.reactionType === activeTab);
  }, [activeTab, messageReactions]);

  useEffect(() => {
    const updateIndicator = () => {
      const el = tabRefs.current[activeTab];
      if (!el) return;
      setIndicatorStyle({ width: el.offsetWidth, left: el.offsetLeft });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab, messageReactions?.length, existingReactionTypes?.length]);

  if (!isOpen) return null;

  const getCount = (type) => {
    return messageReactions.filter((r) => r.reactionType === type).length;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose} 
    >
      <div 
        className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 animate-slideInUp"
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
        <div className="relative flex px-4 border-b border-base-300 overflow-x-auto no-scrollbar gap-2">
          <span
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300"
            style={{ width: indicatorStyle.width, transform: `translateX(${indicatorStyle.left}px)` }}
            aria-hidden
          />
          {/* Tab "Tất cả" */}
          <button 
            onClick={() => setActiveTab("all")}
            ref={(el) => (tabRefs.current["all"] = el)}
            className={`py-3 px-3 text-sm font-medium transition-all whitespace-nowrap relative ${
              activeTab === "all" 
                ? "text-primary" 
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            Tất cả ({messageReactions.length})
          </button>

          {/* Render các tab icon cụ thể */}
          {existingReactionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveTab(type.value)}
              ref={(el) => (tabRefs.current[type.value] = el)}
              className={`py-3 px-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1 relative ${
                activeTab === type.value 
                  ? "text-primary" 
                  : "text-base-content/60 hover:text-base-content"
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