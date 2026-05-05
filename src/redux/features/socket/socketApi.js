import baseApi from "../../api/baseApi";

export const socketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 10 }) => ({
        url: `/chat/conversation/${conversationId}?page=${page}&limit=${limit}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["socket"],
    }),
  }),
});

export const { useGetAllMessagesQuery } = socketApi;
