"use client";

import { FREE_GENERATION_LIMIT } from "../hooks/useGenerationLimit";

export default function GenerationUsage({ count, hydrated }: { count: number; hydrated: boolean }) {
  if (!hydrated) return null;
  const remaining = Math.max(0, FREE_GENERATION_LIMIT - count);
  const limitReached = count >= FREE_GENERATION_LIMIT;

  return (
    <div className={`mx-auto mt-4 max-w-xl rounded-lg px-4 py-3 text-sm ${limitReached ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" : "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"}`}>
      {limitReached
        ? `You have used your ${FREE_GENERATION_LIMIT} free generations. Upgrade is required to generate more.`
        : `${remaining} free generation${remaining === 1 ? "" : "s"} remaining (${count}/${FREE_GENERATION_LIMIT} used).`}
    </div>
  );
}
