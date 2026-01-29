"use server";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
interface UnsplashImage {
  urls: {
    regular: string;
    small: string;
  };
  description?: string;
  alt_description?: string;
  user: {
    name: string;
  };
  links: {
    html: string;
  };
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
}

export async function getUnsplashImages(query: string, page: number = 1) {
  const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!ACCESS_KEY) {
    console.error("Missing Unsplash Access Key");
    return { images: [], totalPages: 0, currentPage: 1 };
  }

  // query: search terms
  // per_page: number of results (max 30 for free tier)
  // page: which page of results to fetch
  // orientation: optional (landscape, portrait, squarish)
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&page=${page}&client_id=${ACCESS_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Unsplash API Error:", errorData.errors[0]);
      return { images: [], totalPages: 0, currentPage: 1 };
    }

    const data: UnsplashResponse = await response.json();
    const images = data.results.map((img: UnsplashImage) => ({
      url: img.urls.regular, // Good for main viewing
      thumbnail: img.urls.small, // Good for grid layouts
      title: img.description || img.alt_description || "Untitled",
      photographer: img.user.name,
      link: img.links.html, // Link back to Unsplash (required by their license)
    }));

    return {
      images,
      totalPages: Math.ceil(data.total / 20), // 20 images per page
      currentPage: page,
      totalResults: data.total,
    };
  } catch (error) {
    console.error("Unsplash search failed:", error);
    return { images: [], totalPages: 0, currentPage: 1 };
  }
}

export async function chatGenerateImage(
  textPrompt: string,
  imagePath: string,
): Promise<string | null> {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    {
      text: textPrompt,
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    console.error("No candidates in response");
    return null;
  }

  const candidate = response.candidates[0];
  if (!candidate.content?.parts) {
    console.error("No content or parts in candidate");
    return null;
  }

  for (const part of candidate.content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      if (imageData) {
        return imageData; // Return the base64 image data
      }
    }
  }

  return null;
}

export async function backgroundGenerateImage(
  personImagePath: string,
  backgroundImagePath: string,
): Promise<string | null> {
  const imageData = fs.readFileSync(personImagePath);
  const base64Image = imageData.toString("base64");

  const backgroundImageData = fs.readFileSync(backgroundImagePath);
  const backgroundBase64Image = backgroundImageData.toString("base64");

  const contents = [
    {
      text: "Please take the person from the first image and place them into the background scene from the second image. Make the integration look natural and seamless.",
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: backgroundBase64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: contents,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    console.error("No candidates in response");
    return null;
  }

  const candidate = response.candidates[0];
  if (!candidate.content?.parts) {
    console.error("No content or parts in candidate");
    return null;
  }

  for (const part of candidate.content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      if (imageData) {
        return imageData; // Return the base64 image data
      }
    }
  }

  return null;
}

export async function backgrundRemovalGenerateImage(
  imagePath: string,
): Promise<string | null> {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const prompt = [
    {
      text: "Please remove the background from this image and make it completely transparent. Keep the main subject intact and ensure clean edges around the subject.",
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    console.error("No candidates in response");
    return null;
  }

  const candidate = response.candidates[0];
  if (!candidate.content?.parts) {
    console.error("No content or parts in candidate");
    return null;
  }

  for (const part of candidate.content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      if (imageData) {
        return imageData; // Return the base64 image data
      }
    }
  }

  return null;
}
