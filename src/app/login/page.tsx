import React, { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthModal";
import { APP_NAME } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${APP_NAME} account to complete your campus order.`,
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/checkout";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Sign In</span>
      </nav>

      <div className="max-w-md mx-auto rounded-[24px] border border-border bg-white p-6 md:p-8 shadow-sm">
        <Suspense fallback={<div className="h-80 animate-pulse bg-surface rounded-2xl" />}>
          <AuthForm redirectTo={redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}
