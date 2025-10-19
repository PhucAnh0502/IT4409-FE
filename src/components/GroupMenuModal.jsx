import { X, MessageSquare, Image, Users } from "lucide-react";
import { useState } from "react";

const GroupMenuModal = ({
  isOpen,
  onClose,
  onShowMembers,
  groupName,
  onUpdateGroupName,
  onUpdateGroupImage,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupName);

  if (!isOpen) return null;

  const handleNameSave = () => {
    if (newGroupName.trim() && newGroupName !== groupName) {
      onUpdateGroupName(newGroupName.trim());
    }
    setIsEditingName(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // URL tạm thời cho ảnh
      const imageUrl = URL.createObjectURL(file);
      onUpdateGroupImage(imageUrl);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-[1px] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-lg w-[320px] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
          <h3 className="text-lg font-semibold text-base-content">
            Tùy chọn nhóm
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-2 bg-base-100">
          {/* Tên cuộc trò chuyện */}
          <div className="px-4 py-3 hover:bg-base-200 transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-base-content/60" />
              <div className="flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="input input-sm input-bordered flex-1 text-xs bg-base-200"
                      autoFocus
                      onClick={(e) => {
                        if (e.key === "Enter") handleNameSave();
                        if (e.key === "Escape") {
                          setIsEditingName(false);
                          setNewGroupName(groupName);
                        }
                      }}
                    />
                    <button
                      onClick={handleNameSave}
                      className="btn btn-primary btn-xs"
                    >
                      Lưu
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col mt-1">
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-base-content/60 hover:text-base-content transition-colors text-left"
                    >
                      <p className="font-medium text-sm text-base-content">
                        Tên cuộc trò chuyện
                      </p>
                      {groupName}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thay đổi ảnh */}
          <div className="px-4 py-3 hover:bg-base-200 transition-colors cursor-pointer">
            <label className="flex items-center gap-3 cursor-pointer">
              <Image size={20} className="text-base-content/60" />
              <div>
                <p className="font-medium text-sm text-base-content">
                  Thay đổi ảnh
                </p>
                <p className="text-xs text-base-content/60">
                  Chọn ảnh mới cho nhóm
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Thành viên */}
          <div
            className="px-4 py-3 hover:bg-base-200 transition-colors cursor-pointer"
            onClick={() => {
              onShowMembers();
              onClose();
            }}
          >
            <div className="flex items-center gap-3">
              <Users size={20} className="text-base-content/60" />
              <div>
                <p className="font-medium text-sm text-base-content">
                  Thành viên
                </p>
                <p className="text-xs text-base-content/60">
                  Xem danh sách thành viên
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMenuModal;
