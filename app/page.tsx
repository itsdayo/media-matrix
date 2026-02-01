"use client";
import { BotMessageSquare, Wallpaper, ImageMinus, Video } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const features = [
  {
    id: "ai-modification",
    icon: BotMessageSquare,
    title: "AI Modification",
    url: "/chat",
    description: "State-of-the-art AI models to chat for edits",
    color: "blue",
    steps: [
      "Upload your image to the AI chat interface",
      "Describe the modifications you want using natural language",
      "AI analyzes your request and applies the changes in real-time",
      "Review and refine the results until you're satisfied",
    ],
  },
  {
    id: "setting-manipulation",
    icon: Wallpaper,
    url: "/background",
    title: "Setting manipulation",
    description:
      "Upload your own image along with the setting image you want to apply",
    color: "white",
    steps: [
      "Upload your main subject image",
      "Choose or upload the background/setting image",
      "AI intelligently blends the two images together",
      "Download your image with the new background",
    ],
  },
  {
    id: "background-removal",
    icon: ImageMinus,
    url: "/background-removal",
    title: "Background Removal",
    description: "Apply a transparent background to your image",
    color: "indigo",
    steps: [
      "Upload the image you want to edit",
      "AI automatically detects and removes the background",
      "Download your image with transparent background",
    ],
  },
  {
    id: "image-to-video",
    icon: Video,
    title: "Image to Video Creation",
    url: "/image-to-video",
    description: "Create a video from an image",
    color: "red",
    steps: [
      "Upload your image to the AI chat interface",
      "Describe the video you want using natural language",
      "AI analyzes your request and applies the changes in real-time",
      "Download your video",
    ],
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Top Navigation Bar */}

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Photo and Video Generation
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Transform your ideas into stunning visuals with our advanced AI
                photo and video generator
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Start Creating
              </button>
            </div>

            {/* Right side - Image demonstration */}
            <div className="flex flex-col items-center lg:items-end space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Image
                    preload={true}
                    src="/images/man-swimsuit.png"
                    alt="Man in swimsuit"
                    width={128}
                    height={128}
                    className="object-cover rounded-lg shadow-md"
                  />
                  <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    1
                  </span>
                </div>
                <div className="text-2xl text-gray-600 dark:text-gray-400 font-bold">
                  +
                </div>
                <div className="relative">
                  <Image
                    preload={true}
                    src="/images/beach.png"
                    alt="Beach background"
                    width={128}
                    height={128}
                    className="object-cover rounded-lg shadow-md"
                  />
                  <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="text-2xl text-gray-600 dark:text-gray-400 font-bold">
                  =
                </div>
                <div className="relative">
                  <Image
                    preload={true}
                    src="/images/manbeach.png"
                    alt="Man on beach result"
                    width={160}
                    height={160}
                    className="object-cover rounded-lg shadow-lg border-2 border-blue-500"
                  />
                  <span className="absolute -top-2 -left-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    AI
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center lg:text-right">
                Combine multiple elements with AI to create your perfect image
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Powerful Features
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeature.id === feature.id;
              const borderColorClass = {
                blue: isSelected ? "border-blue-500" : "border-transparent",
                green: isSelected ? "border-green-500" : "border-transparent",
                purple: isSelected ? "border-purple-500" : "border-transparent",
                red: isSelected ? "border-red-500" : "border-transparent",
                white: isSelected ? "border-gray-400" : "border-transparent",
                indigo: isSelected ? "border-indigo-500" : "border-transparent",
              }[feature.color];

              const iconColorClass = {
                blue: "text-blue-600 dark:text-blue-400",
                green: "text-green-600 dark:text-green-400",
                purple: "text-purple-600 dark:text-purple-400",
                red: "text-red-600 dark:text-red-400",
                white: "text-gray-600 dark:text-gray-400",
                indigo: "text-indigo-600 dark:text-indigo-400",
              }[feature.color];

              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className={`text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 transition-all hover:shadow-lg w-80 ${borderColorClass}`}
                >
                  <Icon
                    className={`w-12 h-12 ${iconColorClass} mx-auto mb-4`}
                  />
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {(() => {
              const selectedFeatureData = features.find(
                (f) => f.id === selectedFeature.id,
              );
              if (!selectedFeatureData) return null;
              return selectedFeatureData.steps.map((step, index) => (
                <div
                  key={index}
                  className={`text-center border-l border-r border-gray-300 dark:border-gray-600 px-4 ${
                    selectedFeatureData.steps.length === 2
                      ? "w-full sm:w-1/2"
                      : selectedFeatureData.steps.length === 3
                        ? "w-full sm:w-1/3"
                        : "w-full sm:w-1/2 lg:w-1/4"
                  }`}
                >
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {index + 1}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.split(" ").slice(0, 1).join(" ")}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{step}</p>
                </div>
              ));
            })()}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => router.push(selectedFeature.url)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start Generating
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-black to-bg-[#1E1F20]">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Create Amazing Images?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators using AI to bring their visions to life
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push("/gallery")}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              View Gallery
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
