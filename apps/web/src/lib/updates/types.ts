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
  isLikedByViewer: boolean;
  isPinned: boolean;
  likeCount: number;
  comments: ContentUpdateComment[];
  commentCount: number;
  updatedAt: string;
};

export type ContentUpdateComment = {
  author: {
    id: string;
    image: null | string;
    name: null | string;
  };
  body: string;
  createdAt: string;
  id: string;
  parentId: null | string;
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
