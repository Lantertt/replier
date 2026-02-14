import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = true }: SidebarProps) {
  return (
    <aside>
      <nav>
        <ul>
          <li>
            <Link href="/dashboard/account">계정 연결</Link>
          </li>
          <li>
            <Link href="/dashboard/posts-comments">게시물 &amp; 댓글</Link>
          </li>
          <li>
            <Link href="/dashboard/drafts">Draft 기록</Link>
          </li>
          {isAdmin ? (
            <li>
              <Link href="/dashboard/admin-context">광고 컨텍스트</Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </aside>
  );
}
