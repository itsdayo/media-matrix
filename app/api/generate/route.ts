import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import {
  chatGenerateImage,
  backgroundGenerateImage,
  backgrundRemovalGenerateImage,
  imageToVideoGenerator,
} from "@/app/api/actions";
import * as fs from "node:fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string; // "chat", "background", "removal", or "video"

    if (type === "background") {
      return handleBackgroundGeneration(formData);
    } else if (type === "removal") {
      return handleBackgroundRemoval(formData);
    } else if (type === "video") {
      return handleVideoGeneration(formData);
    } else {
      return handleChatGeneration(formData);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 },
    );
  }
}

async function handleChatGeneration(formData: FormData) {
  const image = formData.get("image") as File;
  const prompt = formData.get("prompt") as string;

  if (!image || !prompt) {
    return NextResponse.json(
      { success: false, error: "Missing image or prompt" },
      { status: 400 },
    );
  }

  // Create temporary file in /tmp directory
  const tempDir = "/tmp";
  const imagePath = join(tempDir, `chat-${Date.now()}.png`);

  // Write file to disk
  const imageBuffer = Buffer.from(await image.arrayBuffer());
  fs.writeFileSync(imagePath, imageBuffer);

  // Process the image with AI and get base64 result
  const base64Result = await chatGenerateImage(prompt, imagePath);

  // Clean up temporary file
  fs.unlinkSync(imagePath);

  if (base64Result) {
    const imageUrl = `data:image/png;base64,${base64Result}`;
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
    });
  } else {
    return NextResponse.json(
      { success: false, error: "Failed to generate image" },
      { status: 500 },
    );
  }
}

async function handleBackgroundGeneration(formData: FormData) {
  const personImage = formData.get("personImage") as File;
  const backgroundImage = formData.get("backgroundImage") as File;

  if (!personImage || !backgroundImage) {
    return NextResponse.json(
      { error: "Both person and background images are required" },
      { status: 400 },
    );
  }

  // Create temporary files
  const tempDir = "/tmp";
  const personPath = join(tempDir, `person-${Date.now()}.jpg`);
  const backgroundPath = join(tempDir, `background-${Date.now()}.jpg`);

  // Write files to disk
  const personBuffer = Buffer.from(await personImage.arrayBuffer());
  const backgroundBuffer = Buffer.from(await backgroundImage.arrayBuffer());

  fs.writeFileSync(personPath, personBuffer);
  fs.writeFileSync(backgroundPath, backgroundBuffer);

  // Call the background generation function and get base64 result
  const base64Result = await backgroundGenerateImage(
    personPath,
    backgroundPath,
  );

  // Clean up temporary files
  fs.unlinkSync(personPath);
  fs.unlinkSync(backgroundPath);

  if (base64Result) {
    const imageUrl = `data:image/png;base64,${base64Result}`;
    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Background blending completed successfully",
    });
  } else {
    return NextResponse.json(
      { success: false, error: "Failed to generate background image" },
      { status: 500 },
    );
  }
}

async function handleBackgroundRemoval(formData: FormData) {
  const image = formData.get("image") as File;

  if (!image) {
    return NextResponse.json(
      { error: "Image is required for background removal" },
      { status: 400 },
    );
  }

  // Create temporary file
  const tempDir = "/tmp";
  const imagePath = join(tempDir, `removal-${Date.now()}.png`);

  // Write file to disk
  const imageBuffer = Buffer.from(await image.arrayBuffer());
  fs.writeFileSync(imagePath, imageBuffer);

  // Call the background removal function and get base64 result
  const base64Result = await backgrundRemovalGenerateImage(imagePath);

  // Clean up temporary file
  fs.unlinkSync(imagePath);

  if (base64Result) {
    const imageUrl = `data:image/png;base64,${base64Result}`;
    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Background removal completed successfully",
    });
  } else {
    return NextResponse.json(
      { success: false, error: "Failed to remove background" },
      { status: 500 },
    );
  }
}

async function handleVideoGeneration(formData: FormData) {
  const image = formData.get("image") as File;
  const prompt = formData.get("prompt") as string;

  if (!image || !prompt) {
    return NextResponse.json(
      { success: false, error: "Missing image or prompt" },
      { status: 400 },
    );
  }

  // Create temporary file in /tmp directory
  const tempDir = "/tmp";
  const imagePath = join(tempDir, `video-${Date.now()}.png`);

  // Write file to disk
  const imageBuffer = Buffer.from(await image.arrayBuffer());
  fs.writeFileSync(imagePath, imageBuffer);

  // Process the image with AI and get base64 video result
  const base64Result = await imageToVideoGenerator(prompt, imagePath);

  // Clean up temporary file
  fs.unlinkSync(imagePath);

  if (base64Result) {
    const videoUrl = `data:video/mp4;base64,${base64Result}`;
    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
    });
  } else {
    return NextResponse.json(
      { success: false, error: "Failed to generate video" },
      { status: 500 },
    );
  }
}
