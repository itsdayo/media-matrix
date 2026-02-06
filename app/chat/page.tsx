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

function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const imageUrl = searchParams.get("imageUrl");
  const imageId = searchParams.get("imageId");
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted data on component mount
  useEffect(() => {
    const persistedInputText = sessionStorage.getItem("chat-input-text");
    const persistedGeneratedId = sessionStorage.getItem(
      "chat-current-generated-id",
    );
    const persistedSelectedId = sessionStorage.getItem(
      "chat-current-selected-id",
    );

    if (persistedInputText) {
      setInputText(persistedInputText);
    }

    // Handle imageId from navigation
    if (imageId && !selectedImage) {
      const image = sessionStorage.getItem(imageId);
      if (image) {
        persistSelectedImage(image);
      }
    } else if (imageUrl && !selectedImage) {
      // Fallback to direct URL (for backward compatibility)
      persistSelectedImage(imageUrl);
    }

    if (persistedGeneratedId) {
      const generatedImage = getGeneratedImageById(persistedGeneratedId);
      if (generatedImage) {
        setGeneratedImage(generatedImage);
      }
    }
    if (persistedSelectedId && !imageId && !imageUrl) {
      const selectedImage = getSelectedImageById(persistedSelectedId);
      if (selectedImage) {
        setSelectedImage(selectedImage);
      }
    }
  }, [imageId, imageUrl]);

  // Helper functions to persist state
  const persistInputText = (text: string) => {
    // Remove old data first
    sessionStorage.removeItem("chat-input-text");
    sessionStorage.setItem("chat-input-text", text);
    setInputText(text);
  };

  const persistGeneratedImage = (imageUrl: string | null) => {
    // Remove old data first
    const currentId = sessionStorage.getItem("chat-current-generated-id");
    if (currentId) {
      sessionStorage.removeItem(`chat-generated-image-${currentId}`);
      sessionStorage.removeItem("chat-current-generated-id");
    }

    if (imageUrl) {
      // Generate a unique ID for this image
      const imageId = `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(`chat-generated-image-${imageId}`, imageUrl);
      sessionStorage.setItem("chat-current-generated-id", imageId);
      setGeneratedImage(imageUrl);
    } else {
      setGeneratedImage(null);
    }
  };

  const persistSelectedImage = (imageUrl: string | null) => {
    // Remove old data first
    const currentId = sessionStorage.getItem("chat-current-selected-id");
    if (currentId) {
      sessionStorage.removeItem(`chat-selected-image-${currentId}`);
      sessionStorage.removeItem("chat-current-selected-id");
    }

    if (imageUrl) {
      // Generate a unique ID for this image
      const imageId = `selected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(`chat-selected-image-${imageId}`, imageUrl);
      sessionStorage.setItem("chat-current-selected-id", imageId);
      setSelectedImage(imageUrl);
    } else {
      setSelectedImage(null);
    }
  };

  // Helper function to get image by ID
  const getImageById = (imageId: string | null) => {
    if (!imageId) return null;
    return sessionStorage.getItem(imageId);
  };

  // Helper function to get selected image by ID (with proper key prefix)
  const getSelectedImageById = (imageId: string | null) => {
    if (!imageId) return null;
    return sessionStorage.getItem(`chat-selected-image-${imageId}`);
  };

  // Helper function to get generated image by ID (with proper key prefix)
  const getGeneratedImageById = (imageId: string | null) => {
    if (!imageId) return null;
    return sessionStorage.getItem(`chat-generated-image-${imageId}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleImageUpload(files[0]);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      persistSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
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
    if (!inputText.trim() || !selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert base64 to blob for upload
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      // Create FormData to send the file and prompt
      const formData = new FormData();
      formData.append("image", blob, "image.png");
      formData.append("prompt", inputText);

      // Call API route to process the image
      const apiResponse = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        if (result.success && result.imageUrl) {
          persistGeneratedImage(result.imageUrl);
        } else {
          setError("Generation failed. Please try again in a moment.");
          // Fallback to original image if processing fails
          persistGeneratedImage(selectedImage);
        }
      } else {
        setError("Generation failed. Please try again in a moment.");
        console.error("API call failed");
        persistGeneratedImage(selectedImage);
      }
    } catch (error) {
      setError("Generation failed. Please try again in a moment.");
      console.error("Error generating image:", error);
      // Fallback to original image on error
      persistGeneratedImage(selectedImage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !inputText.trim() || !selectedImage || isLoading;

  const handleSetNewPromptPhoto = () => {
    persistSelectedImage(generatedImage);
  };

  const handleBackgroundForegroundNavigation = (imageUrl: string) => {
    // Store the image with a unique ID and pass the ID in URL
    const imageId = `nav-foreground-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(imageId, imageUrl);

    const params = new URLSearchParams({
      imageId: imageId,
      foregroundTitle: "AI Generated Image",
    });
    router.push(`/background?${params.toString()}`);
  };

  const handleBackgroundSettingNavigation = (imageUrl: string) => {
    // Store the image with a unique ID and pass the ID in URL
    const imageId = `nav-background-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(imageId, imageUrl);

    const params = new URLSearchParams({
      imageId: imageId,
      backgroundTitle: "AI Generated Image",
    });
    router.push(`/background?${params.toString()}`);
  };

  const handleBackgroundColorNavigation = (imageUrl: string) => {
    // Store the image with a unique ID and pass the ID in URL
    const imageId = `nav-bg-color-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(imageId, imageUrl);

    const params = new URLSearchParams({
      imageId: imageId,
      title: "AI Generated Image",
    });
    router.push(`/background-color?${params.toString()}`);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Image Generation
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Drop a photo and describe what you want the AI to generate
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          {/* Image Dropbox */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div
              className={`relative border-3 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : selectedImage
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              style={{
                width: "min(40vh, 90vw)",
                height: "min(40vh, 90vw)",
                maxWidth: "350px",
                maxHeight: "350px",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />

              {selectedImage ? (
                <div className="flex relative rounded-2xl items-center justify-center h-full w-full">
                  <Image
                    preload={true}
                    src={selectedImage}
                    alt="Selected image"
                    width={350}
                    height={350}
                    className="object-center"
                    style={{
                      width: "min(35vh, 85vw)",
                      height: "min(35vh, 85vw)",
                      maxWidth: "350px",
                      maxHeight: "350px",
                      margin: "auto",
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      persistSelectedImage(null);
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
                      isDragging
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p
                    className={`text-center font-medium transition-colors ${
                      isDragging
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {isDragging ? "Drop image here" : "Drop your photo here"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    or click to browse
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Result Preview */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-900"
              style={{
                width: "min(40vh, 90vw)",
                height: "min(40vh, 90vw)",
                maxWidth: "350px",
                maxHeight: "350px",
              }}
            >
              {generatedImage ? (
                <div className="w-full h-full relative rounded-2xl overflow-hidden">
                  <Image
                    preload={true}
                    src={generatedImage}
                    alt="AI generated image"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    AI Generated
                  </div>
                  <button
                    onClick={() => {
                      persistGeneratedImage(null);
                      setGeneratedImage(null);
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
                  <button
                    onClick={() =>
                      handleDownload(generatedImage, "ai-generated.png")
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
                      onClick={() => handleSetNewPromptPhoto()}
                      className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                      title="ChatBot"
                    >
                      <BotMessageSquare size={10} />
                    </button>
                    {/* Foreground Button */}
                    <button
                      onClick={() =>
                        handleBackgroundForegroundNavigation(generatedImage)
                      }
                      className="p-1 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg"
                      title="Use as Foreground"
                    >
                      <BringToFront size={10} />
                    </button>

                    {/* Background Button */}
                    <button
                      onClick={() =>
                        handleBackgroundSettingNavigation(generatedImage)
                      }
                      className="p-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                      title="Use as Background"
                    >
                      <Wallpaper size={10} />
                    </button>

                    {/* Background Color Button */}
                    <button
                      onClick={() =>
                        handleBackgroundColorNavigation(generatedImage)
                      }
                      className="p-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                      title="Change Background Color"
                    >
                      <ImagePlus size={10} />
                    </button>

                    {/* Video Button */}
                    <button
                      onClick={() =>
                        handleImageToVideoNavigation(generatedImage)
                      }
                      className="p-1 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors shadow-lg"
                      title="Generate Video"
                    >
                      <Video size={10} />
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    AI will create your image here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Upload a photo and describe what you want
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Text Input */}
          <div className="mb-6 sm:mb-8">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Describe what you want to generate
            </label>
            <textarea
              id="prompt"
              value={inputText}
              onChange={(e) => persistInputText(e.target.value)}
              placeholder="Make this photo brighter and more vibrant with a cinematic look..."
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-sm sm:text-base"
              rows={3}
            />
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
              className={`px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${
                isSubmitDisabled
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Image"
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
              How it works:
            </h3>
            <ol className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>1. Drop a photo in the box above</li>
              <li>2. Describe what changes you want</li>
              <li>
                3. Click &quot;Generate Image&quot; to create your new image
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      }
    >
      <ChatPage />
    </Suspense>
  );
}
