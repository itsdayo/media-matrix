import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GalleryImage {
  url: string;
  title: string;
  thumbnail: string;
}

interface MediaState {
  chat: { inputText: string; selectedImage: string | null; generatedImage: string | null };
  background: { foregroundImage: string | null; backgroundImage: string | null; resultImage: string | null };
  backgroundColor: { selectedImage: string | null; backgroundColor: string; processedImage: string | null };
  video: { inputText: string; selectedImage: string | null; generatedVideo: string | null };
  gallery: { query: string; images: GalleryImage[]; debouncedQuery: string; currentPage: number; totalPages: number; totalResults: number };
  transfers: Record<string, string>;
}

const initialState: MediaState = {
  chat: { inputText: "", selectedImage: null, generatedImage: null },
  background: { foregroundImage: null, backgroundImage: null, resultImage: null },
  backgroundColor: { selectedImage: null, backgroundColor: "#ffffff", processedImage: null },
  video: { inputText: "", selectedImage: null, generatedVideo: null },
  gallery: { query: "", images: [], debouncedQuery: "", currentPage: 1, totalPages: 0, totalResults: 0 },
  transfers: {},
};

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    updateChat: (state, action: PayloadAction<Partial<MediaState["chat"]>>) => { Object.assign(state.chat, action.payload); },
    updateBackground: (state, action: PayloadAction<Partial<MediaState["background"]>>) => { Object.assign(state.background, action.payload); },
    updateBackgroundColor: (state, action: PayloadAction<Partial<MediaState["backgroundColor"]>>) => { Object.assign(state.backgroundColor, action.payload); },
    updateVideo: (state, action: PayloadAction<Partial<MediaState["video"]>>) => { Object.assign(state.video, action.payload); },
    updateGallery: (state, action: PayloadAction<Partial<MediaState["gallery"]>>) => { Object.assign(state.gallery, action.payload); },
    clearGallery: (state) => { state.gallery = initialState.gallery; },
    addTransfer: (state, action: PayloadAction<{ id: string; url: string }>) => {
      state.transfers = { [action.payload.id]: action.payload.url };
    },
    consumeTransfer: (state, action: PayloadAction<string>) => { delete state.transfers[action.payload]; },
  },
});

export const { updateChat, updateBackground, updateBackgroundColor, updateVideo, updateGallery, clearGallery, addTransfer, consumeTransfer } = mediaSlice.actions;
export const makeStore = () => configureStore({
  reducer: { media: mediaSlice.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
