export type ContentUpdate = {
  author: {
    id: string;
    image: null | string;
    name: null | string;
  };
  body: string;
  createdAt: string;
  id: string;
  images: string[];
  isHighlighted: boolean;
  isPinned: boolean;
  updatedAt: string;
};

export type ContentUpdatesResponse = {
  nextCursor: null | string;
  updates: ContentUpdate[];
};

export type ContentUpdateCursor = {
  createdAt: string;
  id: string;
  isPinned: boolean;
};
