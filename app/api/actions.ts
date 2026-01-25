"use server";

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

    const data = await response.json();
    const images = data.results.map((img: any) => ({
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
