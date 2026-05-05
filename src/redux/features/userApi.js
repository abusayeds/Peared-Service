import { baseApi } from "../api/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch currently logged-in user's data
    getUserData: builder.query({
      query: () => ({
        url: "/user/my-profile",
        method: "GET",
      }),
      providesTags: ["auth"],
    }),

    // Update user data
    updateUserData: builder.mutation({
      query: (data) => ({
        url: "/user/update",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),
  }),
});

export const { useGetUserDataQuery, useUpdateUserDataMutation } = userApi;
