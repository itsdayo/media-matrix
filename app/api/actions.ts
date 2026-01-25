"use server";

export async function getUnsplashImages(query: string) {
  const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!ACCESS_KEY) {
    console.error("Missing Unsplash Access Key");
    return [];
  }

  // query: search terms
  // per_page: number of results (max 30 for free tier)
  // orientation: optional (landscape, portrait, squarish)
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&client_id=${ACCESS_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Unsplash API Error:", errorData.errors[0]);
      return [];
    }

    const data = await response.json();
    return data.results.map((img: any) => ({
      url: img.urls.regular, // Good for main viewing
      thumbnail: img.urls.small, // Good for grid layouts
      title: img.description || img.alt_description || "Untitled",
      photographer: img.user.name,
      link: img.links.html, // Link back to Unsplash (required by their license)
    }));
  } catch (error) {
    console.error("Unsplash search failed:", error);
    return [];
  }
}
