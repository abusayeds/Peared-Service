import baseApi from "../../api/baseApi";

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchServices: builder.query({
      query: ({ q = "", limit = 40 } = {}) => ({
        url: "/catalog/services",
        method: "GET",
        params: { q, limit },
      }),
      providesTags: ["catalog"],
    }),
    findOrCreateService: builder.mutation({
      query: (name) => ({
        url: "/catalog/services/find-or-create",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["catalog", "projects"],
    }),
    searchEducations: builder.query({
      query: ({ q = "", limit = 40 } = {}) => ({
        url: "/catalog/educations",
        method: "GET",
        params: { q, limit },
      }),
      providesTags: ["catalog"],
    }),
    findOrCreateEducation: builder.mutation({
      query: (name) => ({
        url: "/catalog/educations/find-or-create",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["catalog"],
    }),
    publicProviders: builder.query({
      query: ({ page = 1, limit = 12, searchTerm, service } = {}) => ({
        url: "/user/public-providers",
        method: "GET",
        params: {
          page,
          limit,
          ...(searchTerm ? { searchTerm } : {}),
          ...(service ? { service } : {}),
        },
      }),
      providesTags: ["providers"],
    }),
    publicProviderDetails: builder.query({
      query: (providerId) => ({
        url: `/user/public-provider/${providerId}`,
        method: "GET",
      }),
      providesTags: ["providers"],
    }),
  }),
});

export const {
  useSearchServicesQuery,
  useLazySearchServicesQuery,
  useFindOrCreateServiceMutation,
  useSearchEducationsQuery,
  useLazySearchEducationsQuery,
  useFindOrCreateEducationMutation,
  usePublicProvidersQuery,
  usePublicProviderDetailsQuery,
} = catalogApi;
