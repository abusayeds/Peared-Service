import baseApi from "../../api/baseApi";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // notifications
    allNotifications: builder.query({
      query: ({ page = 1, limit = 10 }) => {
        return {
          url: "/notifications",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["notifications"],
    }),
  }),
});

export const { useAllNotificationsQuery } = notificationsApi;
