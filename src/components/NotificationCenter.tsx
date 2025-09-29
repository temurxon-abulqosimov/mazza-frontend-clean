import React from 'react';

const NotificationCenter: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
      <div className="text-center py-8">
        <p className="text-gray-500">No notifications</p>
      </div>
    </div>
  );
};

export default NotificationCenter;
