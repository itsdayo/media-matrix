"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setGenerationUsage } from "../store/store";
import { getGenerationCount, incrementGenerationCount } from "../utils/generationUsage";

export const FREE_GENERATION_LIMIT = 3;

export function useGenerationLimit() {
  const dispatch = useAppDispatch();
  const { count, hydrated } = useAppSelector((state) => state.media.usage);

  useEffect(() => {
    getGenerationCount()
      .then((savedCount) => dispatch(setGenerationUsage({ count: savedCount, hydrated: true })))
      .catch(() => dispatch(setGenerationUsage({ count: 0, hydrated: true })));
  }, [dispatch]);

  const recordSuccessfulGeneration = useCallback(async () => {
    const nextCount = await incrementGenerationCount().catch(() => count + 1);
    dispatch(setGenerationUsage({ count: nextCount, hydrated: true }));
  }, [count, dispatch]);

  return {
    count,
    hydrated,
    remaining: Math.max(0, FREE_GENERATION_LIMIT - count),
    limitReached: hydrated && count >= FREE_GENERATION_LIMIT,
    recordSuccessfulGeneration,
  };
}
