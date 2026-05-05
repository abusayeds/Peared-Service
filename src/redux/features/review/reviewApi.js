import baseApi from "../../api/baseApi";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // user side
    topReviews: builder.query({
      query: (id) => {
        return {
          url: `/provider/top-reviews/${id}`,
          method: "GET",
        };
      },
      providesTags: ["review"],
    }),

    // provider side
    providerAllReviews: builder.query({
      query: () => {
        return {
          url: "/provider/my-review",
          method: "GET",
        };
      },
      providesTags: ["review"],
    }),
    myReviews: builder.query({
      query: () => {
        return {
          url: "/provider/avarage-reviews",
          method: "GET",
        };
      },
      providesTags: ["review"],
    }),

    addToFavourite: builder.mutation({
      query: (favData) => {
        return {
          url: "/provider/is-favourite",
          method: "POST",
          body: favData,
        };
      },
      invalidatesTags: ["review"],
    }),
  }),
});

export const {
  useProviderAllReviewsQuery,
  useAddToFavouriteMutation,
  useMyReviewsQuery,
  useTopReviewsQuery,
} = reviewApi;
