"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Download } from "lucide-react";

export default function Chat() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(imageUrl);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setSelectedImage(reader.result as string);
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
          setGeneratedImage(result.imageUrl);
        } else {
          setError("Generation failed. Please try again in a moment.");
          // Fallback to original image if processing fails
          setGeneratedImage(selectedImage);
        }
      } else {
        setError("Generation failed. Please try again in a moment.");
        console.error("API call failed");
        setGeneratedImage(selectedImage);
      }
    } catch (error) {
      setError("Generation failed. Please try again in a moment.");
      console.error("Error generating image:", error);
      // Fallback to original image on error
      setGeneratedImage(selectedImage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !inputText.trim() || !selectedImage || isLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Image Generation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Drop a photo and describe what you want the AI to generate
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Image Dropbox */}
          <div className="flex justify-center mb-8">
            <div
              className={`relative border-3 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : selectedImage
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              style={{
                width: "min(33vh, 33vw)",
                height: "min(33vh, 33vw)",
                maxWidth: "400px",
                maxHeight: "400px",
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
                <div className="w-full h-full relative rounded-2xl overflow-hidden">
                  <Image
                    preload={true}
                    src={selectedImage}
                    alt="Selected image"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
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
          <div className="flex justify-center mb-8">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-900"
              style={{
                width: "min(35vh, 35vw)",
                height: "min(35vh, 35vw)",
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
                    onClick={() => setGeneratedImage(null)}
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
          <div className="mb-8">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Describe what you want to generate
            </label>
            <textarea
              id="prompt"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Make this photo brighter and more vibrant with a cinematic look..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
              rows={4}
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
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
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
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How it works:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
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
