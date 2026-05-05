import baseApi from "../../api/baseApi";

export const balanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //  add balance for users
    addBalance: builder.mutation({
      query: (balanceData) => {
        return {
          url: "/payment/add-balance",
          method: "POST",
          body: balanceData,
        };
      },
      invalidatesTags: ["payment"],
    }),
    // for provider
    withdrawBalance: builder.mutation({
      query: (balanceData) => {
        return {
          url: "/payment/provider-withdraw",
          method: "POST",
          body: balanceData,
        };
      },
      invalidatesTags: ["payment"],
    }),

    //  my wallet
    myWallet: builder.query({
      query: () => {
        return {
          url: "/payment/my-wallat",
          method: "GET",
        };
      },
      providesTags: ["payment"],
    }),

    //  recent payment history
    recentPaymentHistory: builder.query({
      query: ({ page = 1, limit = 5 }) => {
        return {
          url: "payment/my-payment-history",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["payment"],
    }),
  }),
});

export const {
  useAddBalanceMutation,
  useWithdrawBalanceMutation,
  useMyWalletQuery,
  useRecentPaymentHistoryQuery,
} = balanceApi;
