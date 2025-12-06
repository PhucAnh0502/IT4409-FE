import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useUserStore } from '../../../stores/useUserStore.js';
import { useFriendStore } from '../../../stores/useFriendStore.js';
import { getUserIdFromToken } from '../../../lib/utils.js';

const AddFriendModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sentRequests, setSentRequests] = useState(new Set());
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Cache all users for search
    const [isLoading, setIsLoading] = useState(false);
    const [hasSentRequests, setHasSentRequests] = useState(false); // Track if any request was sent
    const { getAllUsers } = useUserStore();
    const { sendFriendRequest, getSentRequests } = useFriendStore();

    // Fetch suggested users when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchSuggestedUsers();
            setSearchQuery(''); // Reset search when modal opens
            setHasSentRequests(false); // Reset flag when modal opens
        }
    }, [isOpen]);

    // Fetch all users when search query changes (with debounce)
    useEffect(() => {
        if (!isOpen) return;

        const handler = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchAllUsersForSearch();
            } else {
                // If search is empty, show suggested users
                fetchSuggestedUsers();
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(handler);
    }, [searchQuery, isOpen]);

    const fetchSuggestedUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch users using store function
            const users = await getAllUsers(1, 10);
            
            // Get current user ID from token
            const currentUserId = getUserIdFromToken();
            
            // Filter out current user
            const filteredUsers = users.filter(user => user.id !== currentUserId);
            
            // Shuffle array randomly and take first 5
            const shuffled = filteredUsers.sort(() => 0.5 - Math.random());
            const randomFive = shuffled.slice(0, 5);
            
            // Map to required format
            const suggested = randomFive.map(user => ({
                id: user.id,
                name: user.fullName,
                avatarUrl: user.avatarUrl || 'https://via.placeholder.com/60',
            }));
            
            setSuggestedUsers(suggested);
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
            // Fetch larger dataset for search (50 users)
            const users = await getAllUsers(1, 50);
            
            // Get current user ID from token
            const currentUserId = getUserIdFromToken();
            
            // Filter out current user
            const filteredUsers = users.filter(user => user.id !== currentUserId);
            
            // Map to required format and cache
            const allUsersMapped = filteredUsers.map(user => ({
                id: user.id,
                name: user.fullName,
                avatarUrl: user.avatarUrl || 'https://via.placeholder.com/60',
            }));
            
            setAllUsers(allUsersMapped);
            
            // Filter by search query
            const searchResults = allUsersMapped.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            setSuggestedUsers(searchResults);
        } catch (error) {
            console.error('Failed to fetch users for search:', error);
            setSuggestedUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleAddFriend = async (userId) => {
        try {
            // Call API to send friend request
            await sendFriendRequest(userId);
            // Update UI state on success
            setSentRequests(prev => new Set(prev).add(userId));
            // Mark that at least one request was sent
            setHasSentRequests(true);
        } catch (error) {
            console.error('Failed to send friend request:', error);
        }
    };

    // Handle modal close - refresh sidebar if any requests were sent
    const handleClose = async () => {
        if (hasSentRequests) {
            // Refresh sidebar sent requests list
            await getSentRequests();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm md:bg-black/40">
            {/* Modal Container */}
            <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-[548px] md:rounded-lg shadow-[0_12px_28px_0_rgba(0,0,0,0.2),0_2px_4px_0_rgba(0,0,0,0.1)] flex flex-col relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="h-[60px] flex items-center justify-center border-b border-[#dbdbdb] relative flex-shrink-0">
                    <h2 className="text-[20px] font-bold text-[#050505]">Add Friends</h2>
                    <button
                        onClick={handleClose}
                        className="absolute right-4 w-9 h-9 bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-full flex items-center justify-center transition-colors text-[#606770]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-[#dbdbdb] flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" size={20} />
                        <input
                            type="text"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#F0F2F5] rounded-full text-[15px] text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Title - Sticky */}
                <div className="px-4 pt-4 pb-2 border-b border-[#E4E6EB]">
                    <h3 className="font-semibold text-[17px] text-[#050505]">
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
                                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-[#F2F2F2] rounded-lg transition-colors group">
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
                                                onClick={() => handleAddFriend(user.id)}
                                                className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-md text-[15px] transition-colors whitespace-nowrap ml-4"
                                            >
                                                Add Friend
                                            </button>
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
