import baseApi from "../../api/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //  get about us data
    getAboutUs: builder.query({
      query: () => ({
        url: "/about",
        method: "GET",
      }),
      providesTags: ["settings"],
    }),
    // get terms and conditions data
    getTermsAndConditions: builder.query({
      query: () => ({
        url: "/terms",
        method: "GET",
      }),
      providesTags: ["settings"],
    }),
    // get privacy policy data
    getPrivacyPolicy: builder.query({
      query: () => ({
        url: "/privacy",
        method: "GET",
      }),
      providesTags: ["settings"],
    }),
  }),
});

export const {
  useGetAboutUsQuery,
  useGetTermsAndConditionsQuery,
  useGetPrivacyPolicyQuery,
} = userApi;
