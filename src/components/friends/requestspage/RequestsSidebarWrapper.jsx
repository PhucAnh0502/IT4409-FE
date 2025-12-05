import React, { useEffect } from 'react';
import Sidebar from '../Sidebar';
import RequestItem from './RequestItem';
import { useFriendStore } from '../../../stores/useFriendStore';

const RequestsSidebarWrapper = ({ onNavigate }) => {
  const { receivedRequests, isLoadingRequests, getReceivedRequests, acceptFriendRequest, deleteFriendRequest } = useFriendStore();

  // Load received requests on mount
  useEffect(() => {
    getReceivedRequests();
  }, [getReceivedRequests]);

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
  if (isLoadingRequests) {
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
      dataList={receivedRequests || []}
      ItemComponent={RequestItem}
      renderSubtitle={renderSubtitle}
      itemComponentProps={{
        onAccept: handleAcceptRequest,
        onDelete: handleDeleteRequest
      }}
    />
  );
};

export default RequestsSidebarWrapper;
