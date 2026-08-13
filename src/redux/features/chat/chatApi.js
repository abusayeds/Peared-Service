import baseApi from "../../api/baseApi";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInbox: builder.query({
      query: () => ({
        url: "/chat/inbox",
        method: "GET",
      }),
      providesTags: ["chat"],
    }),
    getUnreadCount: builder.query({
      query: () => ({
        url: "/chat/unread-count",
        method: "GET",
      }),
      providesTags: ["chat"],
    }),
    startDirectChat: builder.mutation({
      query: (providerId) => ({
        url: "/chat/start-direct",
        method: "POST",
        body: { providerId },
      }),
      invalidatesTags: ["chat"],
    }),
    getConversationMeta: builder.query({
      query: (conversationId) => ({
        url: `/chat/meta/${conversationId}`,
        method: "GET",
      }),
      providesTags: ["chat"],
    }),
    markChatRead: builder.mutation({
      query: (conversationId) => ({
        url: `/chat/mark-read/${conversationId}`,
        method: "POST",
      }),
      invalidatesTags: ["chat"],
    }),
  }),
});

export const {
  useGetInboxQuery,
  useGetUnreadCountQuery,
  useStartDirectChatMutation,
  useGetConversationMetaQuery,
  useMarkChatReadMutation,
} = chatApi;
