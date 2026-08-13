import baseApi from "../../api/baseApi";

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // add project for users
    addProject: builder.mutation({
      query: (projectData) => {
        return {
          url: "/project/create-project",
          method: "POST",
          body: projectData,
        };
      },
      invalidatesTags: ["projects"],
    }),

    createOffer: builder.mutation({
      query: (body) => ({
        url: "/project/create-offer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["projects", "chat"],
    }),

    acceptOffer: builder.mutation({
      query: (bitProjectId) => ({
        url: `/bit/accept-offer/${bitProjectId}`,
        method: "POST",
      }),
      invalidatesTags: ["projects", "chat"],
    }),

    // edit project for users
    editProject: builder.mutation({
      query: ({ id, data }) => {
        // console.log(id, data);
        return {
          url: `/project/update-project/${id}`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["projects"],
    }),

    // all projects for providers
    allProjects: builder.query({
      query: ({ page = 1, limit = 10, searchTerm, projectCategory }) => {
        return {
          url: "/project/my-all-project",
          method: "GET",
          params: {
            page,
            limit,
            ...(searchTerm ? { searchTerm } : {}),
            ...(projectCategory ? { projectCategory } : {}),
          },
        };
      },
      providesTags: ["projects"],
    }),

    // my-projects endpoint with pagination
    myProjects: builder.query({
      query: ({ page = 1, limit = 10 }) => {
        return {
          url: "/project/my-project",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["projects"],
    }),

    // get single project by id
    mySingleProjectById: builder.query({
      query: (id) => {
        return {
          url: `/project/single-project/${id}`,
          method: "GET",
        };
      },
      providesTags: ["projects"],
    }),

    //  my project bits
    myProjectBits: builder.query({
      query: (id) => {
        return {
          url: `/project/bit-project/${id}`,
          method: "GET",
        };
      },
      providesTags: ["projects"],
    }),

    //  my project bit details
    myProjectBitDetails: builder.query({
      query: (id) => {
        return {
          url: `/bit/single-project/${id}`,
          method: "GET",
        };
      },
      providesTags: ["projects"],
    }),

    // project approved
    projectApproved: builder.mutation({
      query: (projectApproveId) => {
        return {
          url: `/bit/bit-project-approved/${projectApproveId}`,
          method: "POST",
        };
      },
      invalidatesTags: ["projects"],
    }),

    // confirm project
    confirmProject: builder.query({
      query: (id) => {
        return {
          url: `/bit/confirm-project/${id}`,
          method: "GET",
        };
      },
      providesTags: ["projects"],
    }),

    // bit/create-bit-project
    createBidProject: builder.mutation({
      query: (bidProjectData) => {
        return {
          url: `/bit/create-bit-project`,
          method: "POST",
          body: bidProjectData,
        };
      },
      invalidatesTags: ["projects"],
    }),
    //  current provider project
    currentProjects: builder.query({
      query: ({ page = 1, limit = 10 }) => {
        return {
          url: `/bit/current-projects`,
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["projects"],
    }),
    //  pending bids project
    pendingBids: builder.query({
      query: ({ page = 1, limit = 10 }) => {
        return {
          url: `/bit/pendings-bits`,
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["projects"],
    }),

    // project OK by use
    projectOkByUser: builder.mutation({
      query: (id) => {
        return {
          url: `/bit/workOkByUser/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["projects"],
    }),
    // project NOT OK by use
    projectNotOkByUser: builder.mutation({
      query: (id) => {
        return {
          url: `/bit/workNotOKByUser/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["projects"],
    }),
    // project DONE by provider
    projectDoneByProvider: builder.mutation({
      query: (id) => {
        console.log(id);
        return {
          url: `/bit/workOkByProvider/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["projects"],
    }),
    // boost project
    boostProject: builder.mutation({
      query: (id) => {
        console.log(id);
        return {
          url: `/project/boost-project/${id}`,
          method: "POST",
        };
      },
      invalidatesTags: ["projects"],
    }),

    // category
    allCategory: builder.query({
      query: () => {
        return {
          url: `/catagory/all-catagory`,
          method: "GET",
        };
      },
      providesTags: ["projects"],
    }),
  }),
});

export const {
  useAddProjectMutation,
  useCreateOfferMutation,
  useAcceptOfferMutation,
  useEditProjectMutation,
  useAllProjectsQuery,
  useMyProjectsQuery,
  useMySingleProjectByIdQuery,
  useMyProjectBitsQuery,
  useMyProjectBitDetailsQuery,
  useProjectApprovedMutation,
  useConfirmProjectQuery,
  useCreateBidProjectMutation,
  useCurrentProjectsQuery,
  usePendingBidsQuery,
  useProjectOkByUserMutation,
  useProjectNotOkByUserMutation,
  useProjectDoneByProviderMutation,
  useBoostProjectMutation,
  useAllCategoryQuery,
} = projectApi;
