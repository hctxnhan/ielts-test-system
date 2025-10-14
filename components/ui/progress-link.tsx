"use client";

import { useEffect } from "react";

import type React from "react";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";

interface ProgressLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  callback?: () => void;
}

export function ProgressLink({
  href,
  children,
  className,
  replace = false,
  callback,
}: ProgressLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isPending) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isPending]);

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        startTransition(() => {
          if (replace) {
            router.replace(href);
          } else {
            router.push(href);
          }
        });
        callback && callback();
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
