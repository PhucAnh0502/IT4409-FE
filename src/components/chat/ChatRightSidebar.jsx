import React, { useState } from "react";
import { X, UserPlus, LogOut, Edit2, Save, UserX } from "lucide-react";
import { useConversationStore } from "../../stores/useConversationStore";
import { getUserIdFromToken } from "../../lib/utils";
import AddMemberModal from "./AddMemberModal"; 

const ChatRightSidebar = ({ conversation, onClose }) => {
  const { 
    leaveGroup, 
    kickMember, 
    addMemberToGroup, 
    updateGroupInfo 
  } = useConversationStore(); 
  
  const currentUserId = getUserIdFromToken();
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(conversation?.name || "");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleUpdateName = async () => {
    if (!groupName.trim()) return;
    try {
      await updateGroupInfo({ newGroupName: groupName });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handleAddMembersFromModal = async (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;
    
    const payload = { memberIds: selectedIds }; 
    await addMemberToGroup(payload);
  };

  const handleKickMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const payload = { memberId: memberId };
      await kickMember(payload);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    try {
      await leaveGroup(); 
      onClose(); 
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const isAdmin = true;
  const existingMemberIds = conversation?.participants?.map(m => m.id) || [];

  return (
    <>
      <div className="w-80 h-full border-l border-base-300 bg-base-100 flex flex-col transition-all duration-300 shadow-xl z-20">
        {/* HEADER */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-100">
          <span className="font-bold text-lg">Group Info</span>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* GROUP AVATAR & NAME */}
          <div className="flex flex-col items-center gap-3">
            <div className="avatar">
              <div className="w-24 rounded-full border-2 border-primary/20 p-1">
                <img src={conversation?.avatarUrl || "/default-group.png"} alt="Group Avatar" className="rounded-full object-cover" />
              </div>
            </div>
            
            <div className="w-full text-center">
               {isEditingName ? (
                 <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                   <input 
                     type="text" 
                     value={groupName}
                     onChange={(e) => setGroupName(e.target.value)}
                     className="input input-bordered input-sm w-full"
                     autoFocus
                   />
                   <button onClick={handleUpdateName} className="btn btn-sm btn-circle btn-primary"><Save size={14}/></button>
                   <button onClick={() => setIsEditingName(false)} className="btn btn-sm btn-circle btn-ghost"><X size={14}/></button>
                 </div>
               ) : (
                 <div className="flex items-center justify-center gap-2 group cursor-pointer" onClick={() => isAdmin && setIsEditingName(true)}>
                   <h3 className="font-bold text-xl">{conversation?.name || "Group Chat"}</h3>
                   {isAdmin && (
                     <Edit2 size={14} className="text-base-content/40 group-hover:text-primary transition-colors"/>
                   )}
                 </div>
               )}
               <p className="text-xs text-base-content/60 mt-1">{conversation?.participants?.length || 0} members</p>
            </div>
          </div>

          <div className="divider my-0"></div>

          {/* BUTTON ADD MEMBER */}
          <div className="space-y-2">
             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="btn btn-primary w-full gap-2 shadow-sm"
             >
               <UserPlus size={18} /> Add Members
             </button>
          </div>

          <div className="divider my-0"></div>

          {/* MEMBER LIST */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
              Members
            </label>
            <div className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto pr-1">
              {conversation?.participants?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded-lg group transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-9 h-9">
                          <img src={member.avatarUrl || "/default-avatar.png"} alt="avt" className="object-cover"/>
                        </div>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight">{member.userName || member.fullName}</span>
                        {member.id === conversation.adminId && <span className="text-[10px] text-primary font-semibold">Admin</span>}
                     </div>
                  </div>
                  
                  {/* Kick Member */}
                  {isAdmin && member.id !== currentUserId && (
                     <button 
                       onClick={() => handleKickMember(member.id)}
                       className="btn btn-ghost btn-xs btn-square text-error/70 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                       title="Remove member"
                     >
                       <UserX size={16} />
                     </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER: LEAVE GROUP */}
        <div className="p-4 border-t border-base-300 bg-base-200/30">
           <button 
             onClick={handleLeaveGroup}
             className="btn btn-outline btn-error btn-sm w-full gap-2"
           >
             <LogOut size={16} /> Leave Group
           </button>
        </div>
      </div>

      {/* MODAL */}
      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        existingMemberIds={existingMemberIds}
        onAddMembers={handleAddMembersFromModal}
      />
    </>
  );
};

export default ChatRightSidebar;