import React from 'react';

interface ConnectionCardProps {
  username?: string;
  igUserId?: string;
  connected: boolean;
}

export default function ConnectionCard({ username, igUserId, connected }: ConnectionCardProps) {
  return (
    <section>
      <h3>Instagram 계정 상태</h3>
      <p>{connected ? '연결됨' : '미연결'}</p>
      {connected ? (
        <p>
          {username} ({igUserId})
        </p>
      ) : (
        <p>아직 연결된 인스타 계정이 없습니다.</p>
      )}
      <a href="/api/instagram/connect">
        <button type="button">Instagram 연결</button>
      </a>
    </section>
  );
}
