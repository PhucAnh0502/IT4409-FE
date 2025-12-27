import React from 'react';

const ReactionSelector = ({ onSelect, reactions, isMe, onClose }) => {
    return (
        <>
            <div 
                className="fixed inset-0 z-10 cursor-default" 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />
            
            <div 
                className={`flex gap-2 bg-base-100 p-2 rounded-full shadow-xl border border-base-300 absolute -top-12 z-20 animate-in fade-in zoom-in duration-200 
                    ${isMe ? "right-0" : "left-0"}`}
                onClick={(e) => e.stopPropagation()} 
            >
                {reactions.map((r) => (
                    <button 
                        key={r.value} 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onSelect(r.value);
                        }}
                        className="hover:scale-150 transition-transform text-xl px-1 active:scale-90"
                        title={r.label}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
        </>
    );
};

export default ReactionSelector;