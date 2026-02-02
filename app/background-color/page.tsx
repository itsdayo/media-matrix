"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, Download, Palette } from "lucide-react";
import Image from "next/image";

export default function BackgroundColor() {
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle URL parameters from gallery navigation
  useEffect(() => {
    const imageUrl = searchParams.get("imageUrl");
    if (imageUrl) {
      setSelectedImage(imageUrl);
    }
  }, [searchParams]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setProcessedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleImageUpload(files[0]);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert base64 to blob for FormData
      const imageBlob = await fetch(selectedImage).then((r) => r.blob());

      const formData = new FormData();
      formData.append("image", imageBlob, "image.png");
      formData.append("backgroundColor", backgroundColor);
      formData.append("type", "background-color");

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();
      setProcessedImage(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "background-changed-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            New Background Color
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload an image and select a color to change the background. Perfect
            for product photos, portraits, and creative projects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Color Selection */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </h2>

              {!selectedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop your image here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex relative rounded-2xl items-center justify-center h-full w-full">
                  <Image
                    src={selectedImage}
                    alt="Selected image"
                    width={375}
                    height={375}
                    style={{
                      width: "min(30vh, 30vw)",
                      height: "min(31vh, 31vw)",
                      maxWidth: "375px",
                      maxHeight: "375px",
                      margin: "auto",
                    }}
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setProcessedImage(null);
                    }}
                    className="absolute top-2 right-36 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Color Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Select Background Color
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-20 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hex Color Code
                    </label>
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#ffffff"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div
                  className="h-16 rounded-md border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: backgroundColor }}
                >
                  <p className="text-center leading-16 text-sm font-medium mix-blend-difference">
                    {backgroundColor.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Result */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Result
              </h2>

              {processedImage ? (
                <div className="flex relative rounded-2xl items-center justify-center h-full w-full">
                  <Image
                    src={processedImage}
                    alt="Processed image"
                    width={375}
                    height={375}
                    style={{
                      width: "min(30vh, 30vw)",
                      height: "min(31vh, 31vw)",
                      maxWidth: "375px",
                      maxHeight: "375px",
                      margin: "auto",
                    }}
                  />
                  <div className="absolute top-2 left-36 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    AI Generated
                  </div>
                  <button
                    onClick={() => setProcessedImage(null)}
                    className="absolute top-2 right-36 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
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
                    onClick={handleDownload}
                    className="absolute bottom-2 right-36 bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Your image with new background will appear here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Upload an image and select a color to get started
                  </p>
                </div>
              )}
            </div>

            {/* Process Button */}
            <button
              onClick={processImage}
              disabled={!selectedImage || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Change Background Color"}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            How to Use Change Background Color
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>1. Upload an image with a clear subject and background</li>
            <li>
              2. Select your desired background color using the color picker
            </li>
            <li>
              3. Click &quot;Change Background Color&quot; to process your image
            </li>
            <li>4. Download your image with the new background color</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
