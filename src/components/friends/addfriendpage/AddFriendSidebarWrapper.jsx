import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import Sidebar from '../Sidebar';
import AddFriendItem from './AddFriendItem';
import AddFriendModal from './AddFriendModal';
import { useFriendStore } from '../../../stores/useFriendStore';
import { useUserStore } from '../../../stores/useUserStore';

const AddFriendSidebarWrapper = ({ onBack, onUserSelect }) => {
  const { sentRequests, isLoadingRequests, getSentRequests, deleteFriendRequest } = useFriendStore();
  const { getUserById } = useUserStore();
  const [enrichedRequests, setEnrichedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load sent requests and fetch user details on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get sent requests
        await getSentRequests();
      } catch (error) {
        console.error('Failed to fetch sent requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getSentRequests]);

  // Fetch user details for each receiver when sentRequests changes
  useEffect(() => {
    const enrichRequestsWithUserData = async () => {
      if (!sentRequests || sentRequests.length === 0) {
        setEnrichedRequests([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch user details for each receiver
        const enrichedData = await Promise.all(
          sentRequests.map(async (request) => {
            try {
              // Get user details for the receiver
              const userData = await getUserById(request.receiverId);
              
              const enrichedItem = {
                ...request,
                // Add user details
                name: userData.fullName || request.receiverName || 'Unknown', // For Sidebar search
                phone: userData.phone ? String(userData.phone) : '', // Convert to string for search
                avatarUrl: userData.avatarUrl || 'https://via.placeholder.com/60', // For AddFriendItem
                receiverFullName: userData.fullName || request.receiverName || 'Unknown',
                receiverAvatar: userData.avatarUrl || 'https://via.placeholder.com/60',
                receiverBio: userData.bio,
                receiverEmail: userData.email,
                receiverPhone: userData.phone,
                receiverUserName: userData.userName,
                receiverCreatedAt: userData.createdAt,
              };
              
              return enrichedItem;
            } catch (error) {
              console.error(`Failed to fetch user ${request.receiverId}:`, error);
              return null;
            }
          })
        );
        
        // Filter out null values
        const validData = enrichedData.filter(item => item !== null);
        setEnrichedRequests(validData);
      } catch (error) {
        console.error('Failed to enrich requests:', error);
        setEnrichedRequests(sentRequests);
      } finally {
        setIsLoading(false);
      }
    };

    enrichRequestsWithUserData();
  }, [sentRequests, getUserById]);

  const handleCancelRequest = async (requestId) => {
    try {
      await deleteFriendRequest(requestId);
      // Reload sent requests after canceling
      await getSentRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const renderSubtitle = (searchQuery, displayedItems) => {
    const count = enrichedRequests?.length || 0;
    return (
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-base-content">
          {searchQuery ? `Search Results` : `${count} request${count !== 1 ? 's' : ''} sent`}
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-base-200 hover:bg-base-300 text-base-content text-[14px] font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          Add
        </button>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-base-100 shadow-sm flex flex-col items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Sidebar
        title="Add Friends"
        showBackButton={true}
        onBack={onBack}
        searchPlaceholder="Search request"
        dataList={enrichedRequests || []}
        ItemComponent={AddFriendItem}
        renderSubtitle={renderSubtitle}
        onItemClick={onUserSelect}
        itemComponentProps={{
          onCancelRequest: handleCancelRequest
        }}
      />
      
      {/* Add Friend Modal */}
      <AddFriendModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default AddFriendSidebarWrapper;
