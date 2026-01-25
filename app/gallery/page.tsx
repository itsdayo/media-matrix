"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BotMessageSquare, User, Wallpaper, ImageMinus } from "lucide-react";
import { getUnsplashImages } from "../api/actions";

interface ImageResult {
  url: string;
  title: string;
  thumbnail: string;
}

interface PaginationData {
  images: ImageResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}

export default function Gallery() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<ImageResult[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved search query and results on mount
  useEffect(() => {
    const savedQuery = sessionStorage.getItem("gallery_search_query");
    const savedImages = sessionStorage.getItem("gallery_search_images");
    const savedDebouncedQuery = sessionStorage.getItem(
      "gallery_debounced_query",
    );

    if (savedQuery) {
      setQuery(savedQuery);
      setDebouncedQuery(savedDebouncedQuery || savedQuery);
    }

    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages);
        setImages(parsedImages);
      } catch (err) {
        console.error("Failed to parse saved images:", err);
      }
    }
  }, []);

  // Save search state to sessionStorage whenever it changes
  useEffect(() => {
    if (query) {
      sessionStorage.setItem("gallery_search_query", query);
    }
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      sessionStorage.setItem("gallery_debounced_query", debouncedQuery);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (images.length > 0) {
      sessionStorage.setItem("gallery_search_images", JSON.stringify(images));
    }
  }, [images]);

  // Debounced search function
  const performSearch = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setDebouncedQuery(searchQuery);
    try {
      const results = await getUnsplashImages(searchQuery, page);
      setImages(results.images);
      setCurrentPage(results.currentPage);
      setTotalPages(results.totalPages);
      setTotalResults(results.totalResults);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for 5 seconds
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Clear search state
  const clearSearchState = () => {
    sessionStorage.removeItem("gallery_search_query");
    sessionStorage.removeItem("gallery_search_images");
    sessionStorage.removeItem("gallery_debounced_query");
    setQuery("");
    setImages([]);
    setDebouncedQuery("");
    setError("");
    setCurrentPage(1);
    setTotalPages(0);
    setTotalResults(0);
  };

  // Handle navigation with image data via URL parameters
  const handleChatNavigation = (image: ImageResult) => {
    const params = new URLSearchParams({
      imageUrl: image.url,
      imageTitle: image.title,
      imageThumbnail: image.thumbnail,
    });
    router.push(`/chat?${params.toString()}`);
  };

  const handleBackgroundPersonNavigation = (image: ImageResult) => {
    const params = new URLSearchParams({
      personUrl: image.url,
      personTitle: image.title,
      personThumbnail: image.thumbnail,
    });
    router.push(`/background?${params.toString()}`);
  };

  const handleBackgroundSettingNavigation = (image: ImageResult) => {
    const params = new URLSearchParams({
      backgroundUrl: image.url,
      backgroundTitle: image.title,
      backgroundThumbnail: image.thumbnail,
    });
    router.push(`/background?${params.toString()}`);
  };

  const handleBackgroundRemovalNavigation = (image: ImageResult) => {
    const params = new URLSearchParams({
      imageUrl: image.url,
      imageTitle: image.title,
      imageThumbnail: image.thumbnail,
    });
    router.push(`/background-removal?${params.toString()}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Clear any pending debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset to first page for new search
    setCurrentPage(1);
    // Perform immediate search
    performSearch(query, 1);
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    performSearch(debouncedQuery, newPage);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Search Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Image Gallery
          </h2>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search for images..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {loading ? "Searching..." : "Search"}
              </button>
              {(query || images.length > 0) && (
                <button
                  type="button"
                  onClick={clearSearchState}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  title="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="text-center text-red-600 dark:text-red-400 mb-8">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  <Image
                    src={image.thumbnail}
                    preload={true}
                    alt={image.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundColor: "#f3f4f6" }}
                    onError={(e) => {
                      console.error("Image failed to load:", image.thumbnail);
                    }}
                    unoptimized
                  />

                  {/* Icon Buttons Overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* ChatBot Button */}
                    <button
                      onClick={() => handleChatNavigation(image)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                      title="ChatBot"
                    >
                      <BotMessageSquare size={16} />
                    </button>

                    {/* Person Button */}
                    <button
                      onClick={() => handleBackgroundPersonNavigation(image)}
                      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg"
                      title="Person"
                    >
                      <User size={16} />
                    </button>

                    {/* Background Button */}
                    <button
                      onClick={() => handleBackgroundSettingNavigation(image)}
                      className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                      title="Background"
                    >
                      <Wallpaper size={16} />
                    </button>

                    {/* Background Removal Button */}
                    <button
                      onClick={() => handleBackgroundRemovalNavigation(image)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Background Removal"
                    >
                      <ImageMinus size={16} />
                    </button>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {image.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && !loading && debouncedQuery && (
            <div className="text-center text-gray-600 dark:text-gray-400 py-12">
              No images found for &quot;{query}&quot;. Try a different search
              term.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Results info */}
          {images.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Showing {images.length} of {totalResults} results (Page{" "}
              {currentPage} of {totalPages})
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
