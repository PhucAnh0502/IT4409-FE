import { X, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const MemberListModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState("all");

    // Danh sách thành viên mẫu
    const members = [
        {
            id: 1,
            name: "Hợp",
            status: "Lê Đức Thắng đã thêm",
            avatar: "https://i.pravatar.cc/50?img=1",
            role: "member"
        },
        {
            id: 2,
            name: "Linh",
            status: "Lê Đức Thắng đã thêm",
            avatar: "https://i.pravatar.cc/50?img=2",
            role: "member"
        },
        {
            id: 3,
            name: "Lê Đức Thắng",
            status: "Người tạo nhóm",
            avatar: "https://i.pravatar.cc/50?img=3",
            role: "admin"
        },
        {
            id: 4,
            name: "Huy Lê",
            status: "Linh đã thêm",
            avatar: "https://i.pravatar.cc/50?img=4",
            role: "member"
        },
    ];

    const admins = members.filter(member => member.role === "admin");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-base-100 rounded-lg w-[400px] max-h-[600px] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="grid grid-cols-3 items-center p-4 border-b border-base-300 bg-base-100">
                    <div></div>
                    <h3 className="text-center text-lg font-semibold text-base-content">Thành viên</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle justify-self-end text-base-content">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-base-300 bg-base-100">
                <button 
                    className={`flex-1 px-4 py-3 text-center border-b-2 ${
                        activeTab === "all" 
                            ? "border-primary text-primary font-medium" 
                            : "border-transparent text-base-content/60 hover:text-base-content"
                    } transition-colors`}
                    onClick={() => setActiveTab("all")}
                >
                    Tất cả
                </button>
                <button 
                    className={`flex-1 px-4 py-3 text-center border-b-2 ${
                        activeTab === "admin" 
                            ? "border-primary text-primary font-medium" 
                            : "border-transparent text-base-content/60 hover:text-base-content"
                    } transition-colors`}
                    onClick={() => setActiveTab("admin")}
                >
                    Quản trị viên
                </button>
                </div>

                {/* Members list */}
                {activeTab === "all" && (
                    <div className="max-h-[400px] overflow-y-auto bg-base-100">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-base-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="avatar">
                            <div className="w-10 rounded-full">
                                    <img src={member.avatar} alt={member.name} />
                            </div>
                            </div>
                            <div>
                            <p className="font-medium text-sm text-base-content">{member.name}</p>
                            <p className="text-xs text-base-content/60">{member.status}</p>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content">
                            <MoreHorizontal size={16} />
                        </button>
                        </div>
                    ))}
                    </div>
                )}

                {/* Admins list */}
                {activeTab === "admin" && (
                    <div className="max-h-[400px] overflow-y-auto bg-base-100">
                    {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-3 hover:bg-base-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="avatar">
                            <div className="w-10 rounded-full">
                                <img src={admin.avatar} alt={admin.name} />
                            </div>
                            </div>
                            <div>
                            <p className="font-medium text-sm text-base-content">{admin.name}</p>
                            <p className="text-xs text-base-content/60">{admin.status}</p>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content">
                            <MoreHorizontal size={16} />
                        </button>
                        </div>
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberListModal;