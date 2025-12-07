import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import RequestItem from './RequestItem';
import { useFriendStore } from '../../../stores/useFriendStore';
import { useUserStore } from '../../../stores/useUserStore';

const RequestsSidebarWrapper = ({ onNavigate, onUserSelect, selectedItemId }) => {
  const { receivedRequests, isLoadingRequests, getReceivedRequests, acceptFriendRequest, deleteFriendRequest } = useFriendStore();
  const { getUserById } = useUserStore();
  const [enrichedRequests, setEnrichedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load received requests on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await getReceivedRequests();
      } catch (error) {
        console.error('Failed to fetch received requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [getReceivedRequests]);

  // Fetch user details for each sender when receivedRequests changes
  useEffect(() => {
    const enrichRequestsWithUserData = async () => {
      if (!receivedRequests || receivedRequests.length === 0) {
        setEnrichedRequests([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch user details for each sender
        const enrichedData = await Promise.all(
          receivedRequests.map(async (request) => {
            try {
              // Get user details for the sender
              const userData = await getUserById(request.senderId);
              
              const enrichedItem = {
                ...request,
                // Add user details for Sidebar search
                name: userData.fullName || request.senderName || 'Unknown',
                phone: userData.phone ? String(userData.phone) : '',
                // Add user details for RequestItem display
                avatarUrl: userData.avatarUrl || 'https://via.placeholder.com/60',
                senderFullName: userData.fullName || request.senderName || 'Unknown',
                senderAvatar: userData.avatarUrl || 'https://via.placeholder.com/60',
                senderBio: userData.bio,
                senderEmail: userData.email,
                senderPhone: userData.phone,
                senderUserName: userData.userName,
                senderCreatedAt: userData.createdAt,
              };
              
              return enrichedItem;
            } catch (error) {
              console.error(`Failed to fetch user ${request.senderId}:`, error);
              return null;
            }
          })
        );
        
        // Filter out null values
        const validData = enrichedData.filter(item => item !== null);
        setEnrichedRequests(validData);
      } catch (error) {
        console.error('Failed to enrich requests:', error);
        setEnrichedRequests(receivedRequests);
      } finally {
        setIsLoading(false);
      }
    };

    enrichRequestsWithUserData();
  }, [receivedRequests, getUserById]);

  const renderSubtitle = (searchQuery, displayedItems) => {
    const count = receivedRequests?.length || 0;
    return (
      <>
        <h2 className="text-[20px] font-bold text-base-content">
          {searchQuery ? 'Search Results' : `${count} friend request${count !== 1 ? 's' : ''}`}
        </h2>
        <button 
          onClick={() => onNavigate('add_friend')}
          className="text-[15px] text-primary hover:underline mt-1 block cursor-pointer bg-transparent border-none text-left p-0"
        >
          View sent requests
        </button>
      </>
    );
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      // Reload received requests after accepting
      await getReceivedRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await deleteFriendRequest(requestId);
      // Reload received requests after deleting
      await getReceivedRequests();
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
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
    <Sidebar
      title="Friend Requests"
      showBackButton={true}
      useNavigateBack={true}
      navigateBackPath="/"
      searchPlaceholder="Search requests"
      dataList={enrichedRequests || []}
      ItemComponent={RequestItem}
      renderSubtitle={renderSubtitle}
      onItemClick={onUserSelect}
      selectedItemId={selectedItemId}
      itemComponentProps={{
        onAccept: handleAcceptRequest,
        onDelete: handleDeleteRequest
      }}
    />
  );
};

export default RequestsSidebarWrapper;
