import React, { useEffect } from 'react';
import Sidebar from '../Sidebar';
import AddFriendItem from './AddFriendItem';
import { useFriendStore } from '../../../stores/useFriendStore';

const AddFriendSidebarWrapper = ({ onBack }) => {
  const { sentRequests, isLoadingRequests, getSentRequests, deleteFriendRequest } = useFriendStore();

  // Load sent requests on mount
  useEffect(() => {
    getSentRequests();
  }, [getSentRequests]);

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
    const count = sentRequests?.length || 0;
    return (
      <h2 className="text-[17px] font-semibold text-base-content">
        {searchQuery ? `Search Results` : `${count} request${count !== 1 ? 's' : ''} sent`}
      </h2>
    );
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
      title="Add Friends"
      showBackButton={true}
      onBack={onBack}
      searchPlaceholder="Search people"
      dataList={sentRequests || []}
      ItemComponent={AddFriendItem}
      renderSubtitle={renderSubtitle}
      itemComponentProps={{
        onCancelRequest: handleCancelRequest
      }}
    />
  );
};

export default AddFriendSidebarWrapper;
