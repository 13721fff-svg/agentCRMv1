import { create } from 'zustand';

export interface Review {
  id: string;
  reviewer_id: string;
  provider_id: string;
  order_id?: string;
  rating: number;
  comment: string;
  reply?: string;
  replied_at?: string;
  helpful_count: number;
  photos: string[];
  created_at: string;
  reviewer?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ReviewsStore {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  reset: () => void;
}

export const useReviewsStore = create<ReviewsStore>((set) => ({
  reviews: [],

  setReviews: (reviews) => set({ reviews }),

  addReview: (review) =>
    set((state) => ({
      reviews: [review, ...state.reviews],
    })),

  updateReview: (id, data) =>
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === id ? { ...review, ...data } : review
      ),
    })),

  deleteReview: (id) =>
    set((state) => ({
      reviews: state.reviews.filter((review) => review.id !== id),
    })),

  reset: () => set({ reviews: [] }),
}));
