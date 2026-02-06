"use client";

import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Media Matrix
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your creative vision into stunning visuals with the power
            of artificial intelligence
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            Our Mission
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Media Matrix is dedicated to making advanced AI-powered image and
              video generation accessible to everyone. We believe that
              creativity should have no boundaries, and our tools are designed
              to bridge the gap between imagination and reality.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                🎨 AI Image Generation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Generate stunning images from text descriptions and modify
                existing photos using natural language commands.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                🎬 Image to Video
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Transform static images into dynamic videos with AI-powered
                animation and motion generation.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                🖼️ Background Creation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Seamlessly blend subjects with new backgrounds or remove
                unwanted elements from your photos.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                💬 Chat Interface
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Modify images through conversational AI - just describe what you
                want and watch the magic happen.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            Powered by Advanced AI
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  State-of-the-Art Models
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Latest generation AI models for superior quality and realism
                </p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Lightning Fast
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Optimized processing for quick results without compromising
                  quality
                </p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Secure & Private
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Your creations are yours - we respect your privacy and data
                  ownership
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Create?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
            Join thousands of creators using Media Matrix to bring their visions
            to life
          </p>
          <div className="space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
            <Link
              href="/"
              className="block sm:inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Get Started
            </Link>
            <Link
              href="/gallery"
              className="block sm:inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              View Gallery
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
