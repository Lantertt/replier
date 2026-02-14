import React from 'react';

import ConnectionCard from '@/components/account/connection-card';

export default function AccountPage() {
  return (
    <div>
      <h2>계정 연결</h2>
      <ConnectionCard connected={false} />
    </div>
  );
}
