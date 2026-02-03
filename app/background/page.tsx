"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Download,
  BotMessageSquare,
  BringToFront,
  Wallpaper,
  ImagePlus,
  Video,
} from "lucide-react";

function BackgroundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const foregroundUrl = searchParams.get("foregroundUrl");
  const backgroundUrl = searchParams.get("backgroundUrl");
  const imageId = searchParams.get("imageId");
  const foregroundTitle = searchParams.get("foregroundTitle");
  const backgroundTitle = searchParams.get("backgroundTitle");

  const [foregroundImage, setForegroundImage] = useState<string | null>(
    foregroundUrl,
  );
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    backgroundUrl,
  );
  const [isDraggingForeground, setIsDraggingForeground] = useState(false);
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const foregroundFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted data on component mount
  useEffect(() => {
    const persistedForegroundImage = sessionStorage.getItem(
      "bg-foreground-image",
    );
    const persistedBackgroundImage = sessionStorage.getItem(
      "bg-background-image",
    );
    const persistedResultImage = sessionStorage.getItem("bg-result-image");

    // Handle imageId from navigation with title-based distinction
    if (imageId && !foregroundUrl && !backgroundUrl) {
      const image = sessionStorage.getItem(imageId);
      if (image) {
        // Use title parameter to determine if this is foreground or background
        if (foregroundTitle) {
          persistForegroundImage(image);
        } else if (backgroundTitle) {
          persistBackgroundImage(image);
        } else {
          // Default to foreground if no title specified
          persistForegroundImage(image);
        }
      }
    }

    // Load persisted foreground image if not set by URL parameters
    if (persistedForegroundImage && !foregroundUrl) {
      setForegroundImage(persistedForegroundImage);
    }

    // Load persisted background image if not set by URL parameters
    if (persistedBackgroundImage && !backgroundUrl) {
      setBackgroundImage(persistedBackgroundImage);
    }

    // Always load result image
    if (persistedResultImage) {
      setResultImage(persistedResultImage);
    }
  }, [foregroundUrl, backgroundUrl, imageId, foregroundTitle, backgroundTitle]);

  // Helper functions to persist state
  const persistForegroundImage = (imageUrl: string | null) => {
    // Remove old data first
    sessionStorage.removeItem("bg-foreground-image");

    if (imageUrl) {
      sessionStorage.setItem("bg-foreground-image", imageUrl);
      setForegroundImage(imageUrl);
    } else {
      setForegroundImage(null);
    }
  };

  const persistBackgroundImage = (imageUrl: string | null) => {
    // Remove old data first
    sessionStorage.removeItem("bg-background-image");

    if (imageUrl) {
      sessionStorage.setItem("bg-background-image", imageUrl);
      setBackgroundImage(imageUrl);
    } else {
      setBackgroundImage(null);
    }
  };

  const persistResultImage = (imageUrl: string | null) => {
    // Remove old data first
    sessionStorage.removeItem("bg-result-image");

    if (imageUrl) {
      sessionStorage.setItem("bg-result-image", imageUrl);
      setResultImage(imageUrl);
    } else {
      setResultImage(null);
    }
  };

  const handleDragOver = (
    e: React.DragEvent,
    type: "foreground" | "background",
  ) => {
    e.preventDefault();
    if (type === "foreground") {
      setIsDraggingForeground(true);
    } else {
      setIsDraggingBackground(true);
    }
  };

  const handleDragLeave = (
    e: React.DragEvent,
    type: "foreground" | "background",
  ) => {
    e.preventDefault();
    if (type === "foreground") {
      setIsDraggingForeground(false);
    } else {
      setIsDraggingBackground(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    type: "foreground" | "background",
  ) => {
    e.preventDefault();
    if (type === "foreground") {
      setIsDraggingForeground(false);
    } else {
      setIsDraggingBackground(false);
    }

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleImageUpload(files[0], type);
    }
  };

  const handleImageUpload = (file: File, type: "foreground" | "background") => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "foreground") {
        persistForegroundImage(reader.result as string);
      } else {
        persistBackgroundImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "foreground" | "background",
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file, type);
    }
  };

  const handleDownload = async (
    imageUrl: string,
    filename: string = "generated-image.png",
  ) => {
    try {
      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleSubmit = async () => {
    if (!foregroundImage || !backgroundImage) return;

    setIsLoading(true);
    persistResultImage(null);
    setError(null);

    try {
      // Create FormData to send files to server
      const formData = new FormData();

      // Convert base64 to blob and append to FormData
      const foregroundBlob = await fetch(foregroundImage).then((r) => r.blob());
      const backgroundBlob = await fetch(backgroundImage).then((r) => r.blob());

      formData.append("foregroundImage", foregroundBlob, "foreground.jpg");
      formData.append("backgroundImage", backgroundBlob, "background.jpg");

      // Call API endpoint instead of server action directly
      formData.append("type", "background");
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const result = await response.json();

      if (result.success) {
        // Optionally set result image if the API returns it
        if (result.imageUrl) {
          persistResultImage(result.imageUrl);
        }
      } else {
        setError("Generation failed. Please try again in a moment.");
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      setError("Generation failed. Please try again in a moment.");
      console.error("Error blending images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !foregroundImage || !backgroundImage || isLoading;

  // Navigation handlers
  const handleChatNavigation = (imageUrl: string) => {
    // Store the image with a unique ID and pass the ID in URL
    const imageId = `nav-chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(imageId, imageUrl);

    const params = new URLSearchParams({
      imageId: imageId,
    });
    router.push(`/chat?${params.toString()}`);
  };

  const handleImageToVideoNavigation = (imageUrl: string) => {
    // Store the image with a unique ID and pass the ID in URL
    const imageId = `nav-video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(imageId, imageUrl);

    const params = new URLSearchParams({
      imageId: imageId,
      title: "AI Generated Image",
    });
    router.push(`/image-to-video?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Background
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload a foreground image and a background to create your perfect
            scene
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Image Upload Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Foreground Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Foreground
              </h3>
              <div className="flex justify-center">
                <button
                  className={`relative border-3 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
                    isDraggingForeground
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : foregroundImage
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                  style={{
                    width: "min(30vh, 30vw)",
                    height: "min(30vh, 30vw)",
                    maxWidth: "300px",
                    maxHeight: "300px",
                  }}
                  onDragOver={(e) => handleDragOver(e, "foreground")}
                  onDragLeave={(e) => handleDragLeave(e, "foreground")}
                  onDrop={(e) => handleDrop(e, "foreground")}
                  onClick={() => foregroundFileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={foregroundFileInputRef}
                    onChange={(e) => handleFileSelect(e, "foreground")}
                    accept="image/*"
                    className="hidden"
                  />

                  {foregroundImage ? (
                    <div className="flex relative rounded-2xl items-center justify-center h-full w-full">
                      <Image
                        preload={true}
                        src={foregroundImage}
                        alt="Foreground image"
                        width={375}
                        height={375}
                        style={{
                          width: "min(27vh, 27vw)",
                          height: "min(27vh, 27vw)",
                          maxWidth: "375px",
                          maxHeight: "375px",
                          margin: "auto",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          persistForegroundImage(null);
                          setForegroundImage(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <svg
                        className={`w-12 h-12 mb-4 transition-colors ${
                          isDraggingForeground
                            ? "text-blue-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <p
                        className={`text-center font-medium transition-colors ${
                          isDraggingForeground
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {isDraggingForeground
                          ? "Drop image here"
                          : "Drop foreground image"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        or click to browse
                      </p>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Background Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Background
              </h3>
              <div className="flex justify-center">
                <button
                  type="button"
                  className={`relative border-3 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
                    isDraggingBackground
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : backgroundImage
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                  onDragOver={(e) => handleDragOver(e, "background")}
                  onDragLeave={(e) => handleDragLeave(e, "background")}
                  onDrop={(e) => handleDrop(e, "background")}
                  onClick={() => backgroundFileInputRef.current?.click()}
                  style={{
                    width: "min(30vh, 30vw)",
                    height: "min(30vh, 30vw)",
                    maxWidth: "300px",
                    maxHeight: "300px",
                  }}
                >
                  <input
                    type="file"
                    ref={backgroundFileInputRef}
                    onChange={(e) => handleFileSelect(e, "background")}
                    accept="image/*"
                    className="hidden"
                  />

                  {backgroundImage ? (
                    <div className="flex relative rounded-2xl items-center justify-center h-full w-full">
                      <Image
                        preload={true}
                        src={backgroundImage}
                        alt="Background image"
                        width={375}
                        height={375}
                        style={{
                          width: "min(27vh, 27vw)",
                          height: "min(27vh, 27vw)",
                          maxWidth: "365px",
                          maxHeight: "365px",
                          margin: "auto",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          persistBackgroundImage(null);
                          setBackgroundImage(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <svg
                        className={`w-12 h-12 mb-4 transition-colors ${
                          isDraggingBackground
                            ? "text-blue-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p
                        className={`text-center font-medium transition-colors ${
                          isDraggingBackground
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {isDraggingBackground
                          ? "Drop image here"
                          : "Drop background photo"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        or click to browse
                      </p>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Plus Symbol */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>

          {/* Result Preview Area */}
          <div className="flex justify-center mb-8">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                width: "min(35vh, 35vw)",
                height: "min(35vh, 35vw)",
                maxWidth: "350px",
                maxHeight: "350px",
              }}
            >
              {resultImage ? (
                <div className="w-full h-full relative rounded-2xl overflow-hidden">
                  <Image
                    src={resultImage}
                    alt="Generated result"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    AI Generated
                  </div>
                  <button
                    onClick={() => persistResultImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(resultImage, "background-blended.png")
                    }
                    className="absolute bottom-2 right-2 bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>

                  {/* Action Buttons */}
                  <div className="absolute bottom-2 left-2 flex gap-0.5 transition-opacity duration-200 bg-black/20 backdrop-blur-sm rounded-full p-0.5">
                    {/* ChatBot Button */}
                    <button
                      onClick={() => handleChatNavigation(resultImage)}
                      className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                      title="ChatBot"
                    >
                      <BotMessageSquare size={12} />
                    </button>

                    {/* Video Button */}
                    <button
                      onClick={() => handleImageToVideoNavigation(resultImage)}
                      className="p-1 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors shadow-lg"
                      title="Generate Video"
                    >
                      <Video size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    AI will blend your images here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Upload both photos to see the result
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex justify-center mb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isSubmitDisabled
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Blending...</span>
                </div>
              ) : (
                "Blend Images"
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How it works:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>1. Upload a foreground on the left</li>
              <li>2. Upload a background on the right</li>
              <li>
                3. Click &quot;Blend Images&quot; to create your perfect scene
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Background() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      }
    >
      <BackgroundPage />
    </Suspense>
  );
}
