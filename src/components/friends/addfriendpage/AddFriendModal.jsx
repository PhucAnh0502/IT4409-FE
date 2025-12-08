import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { useUserStore } from '../../../stores/useUserStore.js';
import { useFriendStore } from '../../../stores/useFriendStore.js';
import { getUserIdFromToken } from '../../../lib/utils.js';

const AddFriendModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sentRequests, setSentRequests] = useState(new Set());
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSentRequests, setHasSentRequests] = useState(false);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [userMessages, setUserMessages] = useState({});
    const { getAllUsers } = useUserStore();
    const { sendFriendRequest, getSentRequests } = useFriendStore();

    // Fetch suggested users when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchSuggestedUsers();
            setSearchQuery('');
            setHasSentRequests(false);
            setExpandedUserId(null);
            setUserMessages({});
        }
    }, [isOpen]);

    // Fetch all users when search query changes (with debounce)
    useEffect(() => {
        if (!isOpen) return;

        const handler = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchAllUsersForSearch();
            } else {
                fetchSuggestedUsers();
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, isOpen]);

    const fetchSuggestedUsers = async () => {
        setIsLoading(true);
        try {
            const users = await getAllUsers(1, 10);
            const currentUserId = getUserIdFromToken();
            
            const filteredUsers = users
                .filter(user => user.id !== currentUserId)
                .map(user => ({
                    id: user.id,
                    name: user.fullName || user.userName || 'Unknown',
                    avatarUrl: user.avatarUrl || 'https://via.placeholder.com/60'
                }));
                
            setSuggestedUsers(filteredUsers.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch suggested users:', error);
            setSuggestedUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllUsersForSearch = async () => {
        setIsLoading(true);
        try {
            if (allUsers.length === 0) {
                const users = await getAllUsers(1, 50);
                setAllUsers(users);
            }
            
            const currentUserId = getUserIdFromToken();
            const query = searchQuery.toLowerCase().trim();
            
            const searchResults = allUsers
                .filter(user => {
                    if (user.id === currentUserId) return false;
                    const fullName = (user.fullName || '').toLowerCase();
                    const userName = (user.userName || '').toLowerCase();
                    const email = (user.email || '').toLowerCase();
                    const phone = (user.phone || '').toString();
                    
                    return fullName.includes(query) || 
                           userName.includes(query) || 
                           email.includes(query) ||
                           phone.includes(query);
                })
                .map(user => ({
                    id: user.id,
                    name: user.fullName || user.userName || 'Unknown',
                    avatarUrl: user.avatarUrl || 'https://via.placeholder.com/60'
                }));
            
            setSuggestedUsers(searchResults);
        } catch (error) {
            console.error('Failed to fetch users for search:', error);
            setSuggestedUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleAddFriendClick = (userId) => {
        if (expandedUserId === userId) {
            // Second click - send request
            handleSendRequest(userId);
        } else {
            // First click - show message input
            setExpandedUserId(userId);
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            const message = userMessages[userId] || "Hi, let's be friends!";
            await sendFriendRequest(userId, message);
            setSentRequests(prev => new Set(prev).add(userId));
            setHasSentRequests(true);
            setExpandedUserId(null);
            setUserMessages(prev => ({ ...prev, [userId]: '' }));
        } catch (error) {
            console.error('Failed to send friend request:', error);
        }
    };

    const handleMessageChange = (userId, message) => {
        setUserMessages(prev => ({ ...prev, [userId]: message }));
    };

    const handleClose = async () => {
        if (hasSentRequests) {
            await getSentRequests();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] flex flex-col md:max-h-[80vh] max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Add Friends</h2>
                    <button 
                        onClick={handleClose}
                        className="w-9 h-9 flex items-center justify-center bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-full transition-colors"
                    >
                        <X size={20} className="text-[#050505]" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-3 border-b border-gray-200">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#65676B]" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or phone..."
                            className="w-full bg-[#F0F2F5] text-[15px] rounded-full py-2 pl-9 pr-4 outline-none focus:ring-2 focus:ring-primary/30 text-[#050505] placeholder-[#65676B]"
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="text-[17px] font-semibold text-[#050505]">
                        {searchQuery ? `Search Results (${suggestedUsers.length})` : `Suggested for you (${suggestedUsers.length})`}
                    </h3>
                </div>

                {/* Content - Scrollable */}
                <div className="p-4 overflow-y-auto flex-1 md:flex-initial md:min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="loading loading-spinner loading-lg text-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col space-y-2">
                                {suggestedUsers.map((user) => (
                                    <div key={user.id} className="flex flex-col">
                                        <div className="flex items-center justify-between p-2 hover:bg-[#F2F2F2] rounded-lg transition-colors group">
                                            {/* User Info */}
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    className="w-[60px] h-[60px] rounded-full object-cover border border-gray-100"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[17px] text-[#050505] leading-snug">{user.name}</span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {sentRequests.has(user.id) ? (
                                                <span className="text-[13px] text-[#65676B] italic px-4">
                                                    Request sent
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleAddFriendClick(user.id)}
                                                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-md text-[15px] transition-colors whitespace-nowrap ml-4 flex items-center gap-1"
                                                >
                                                    {expandedUserId === user.id ? 'Send Request' : 'Add Friend'}
                                                    {expandedUserId !== user.id && <ChevronDown size={16} />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Message Input - Slides down when expanded */}
                                        {expandedUserId === user.id && (
                                            <div className="overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                <div className="px-2 pb-2 pt-1">
                                                    <div className="bg-[#F0F2F5] rounded-lg p-3 border border-primary/20">
                                                        <label className="text-[13px] font-semibold text-[#65676B] mb-1 block">
                                                            Add a message (optional)
                                                        </label>
                                                        <textarea
                                                            value={userMessages[user.id] || ''}
                                                            onChange={(e) => handleMessageChange(user.id, e.target.value)}
                                                            placeholder="Hi, let's be friends!"
                                                            className="w-full bg-white text-[15px] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 text-[#050505] placeholder-[#65676B] resize-none"
                                                            rows={2}
                                                            maxLength={200}
                                                        />
                                                        <div className="text-right">
                                                            <span className="text-[12px] text-[#65676B]">
                                                                {(userMessages[user.id] || '').length}/200
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {suggestedUsers.length === 0 && !isLoading && (
                                <div className="text-center py-12">
                                    <p className="text-[#65676B] text-[15px]">No results found</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
