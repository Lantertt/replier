import React from 'react';
import Link from 'next/link';
import { BookText, BotMessageSquare, Megaphone, MessageCircleHeart, Plug } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SidebarProps {
  isAdmin?: boolean;
}

const baseItems = [
  { href: '/dashboard/account', label: '계정 연결', icon: Plug },
  { href: '/dashboard/posts-comments', label: '게시물 & 댓글', icon: MessageCircleHeart },
  { href: '/dashboard/drafts', label: 'Draft 기록', icon: BookText },
];

export default function Sidebar({ isAdmin = true }: SidebarProps) {
  const items = isAdmin ? [...baseItems, { href: '/dashboard/admin-context', label: '광고 컨텍스트', icon: Megaphone }] : baseItems;

  return (
    <aside className="glass-panel h-fit w-full p-4 lg:sticky lg:top-6 lg:w-80">
      <div className="mb-5 rounded-2xl border border-[hsl(var(--border))/0.7] bg-[hsl(var(--background))/0.5] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Workstream</p>
        <p className="mt-2 text-sm text-[hsl(var(--foreground))/0.88]">
          Reply generation + 게시 자동화 플로우를 단계별로 운영하세요.
        </p>
      </div>

      <nav>
        <ul className="space-y-2">
          {items.map(({ href, label, icon: Icon }, index) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-[hsl(var(--foreground))/0.88] transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--background))/0.75] hover:shadow-[0_8px_25px_-20px_rgba(18,14,11,0.9)]',
                  index === 0 && 'animate-float',
                )}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] transition group-hover:bg-[hsl(var(--accent))/0.18] group-hover:text-[hsl(var(--accent))]">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 rounded-2xl border border-[hsl(var(--border))/0.8] bg-[hsl(var(--secondary))/0.65] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
          <BotMessageSquare className="h-4 w-4" />
          AI 상태
        </div>
        <p className="mt-2 text-sm text-[hsl(var(--foreground))/0.86]">댓글 분류 + 판매 문맥 주입 엔진이 준비되었습니다.</p>
      </div>
    </aside>
  );
}
