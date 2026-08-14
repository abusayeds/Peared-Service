import baseApi from "../../api/baseApi";

export const pmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPmProjects: builder.query({
      query: ({ page = 1, limit = 12, searchTerm, status } = {}) => ({
        url: "/pm/projects",
        params: {
          page,
          limit,
          ...(searchTerm ? { searchTerm } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["pm"],
    }),
    getPmProject: builder.query({
      query: (id) => `/pm/projects/${id}`,
      providesTags: ["pm"],
    }),
    getPmEligible: builder.query({
      query: () => ({ url: "/pm/projects", params: { eligible: true } }),
      providesTags: ["pm"],
    }),
    createPmProject: builder.mutation({
      query: (body) => ({ url: "/pm/projects", method: "POST", body }),
      invalidatesTags: ["pm"],
    }),
    updatePmProject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pm/projects/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    deletePmProject: builder.mutation({
      query: (id) => ({ url: `/pm/projects/${id}`, method: "DELETE" }),
      invalidatesTags: ["pm"],
    }),
    getPmStages: builder.query({
      query: ({ type, projectId } = {}) => ({
        url: "/pm/stages",
        params: {
          ...(type ? { type } : {}),
          ...(projectId ? { projectId } : {}),
        },
      }),
      providesTags: ["pm"],
    }),
    createPmStage: builder.mutation({
      query: (body) => ({ url: "/pm/stages", method: "POST", body }),
      invalidatesTags: ["pm"],
    }),
    updatePmStage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pm/stages/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    reorderPmStages: builder.mutation({
      query: (ids) => ({
        url: "/pm/stages/reorder",
        method: "PATCH",
        body: { ids },
      }),
      invalidatesTags: ["pm"],
    }),
    deletePmStage: builder.mutation({
      query: (id) => ({ url: `/pm/stages/${id}`, method: "DELETE" }),
      invalidatesTags: ["pm"],
    }),
    createPmTask: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/pm/projects/${projectId}/tasks`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    updatePmTask: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pm/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    deletePmTask: builder.mutation({
      query: (id) => ({ url: `/pm/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["pm"],
    }),
    createPmBug: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/pm/projects/${projectId}/bugs`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    updatePmBug: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pm/bugs/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    deletePmBug: builder.mutation({
      query: (id) => ({ url: `/pm/bugs/${id}`, method: "DELETE" }),
      invalidatesTags: ["pm"],
    }),
    createPmMilestone: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/pm/projects/${projectId}/milestones`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    updatePmMilestone: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pm/milestones/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["pm"],
    }),
    deletePmMilestone: builder.mutation({
      query: (id) => ({ url: `/pm/milestones/${id}`, method: "DELETE" }),
      invalidatesTags: ["pm"],
    }),
    addPmAttachment: builder.mutation({
      query: ({ projectId, formData }) => ({
        url: `/pm/projects/${projectId}/attachments`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["pm"],
    }),
    deletePmAttachment: builder.mutation({
      query: (id) => ({ url: `/pm/attachments/${id}`, method: "DELETE" }),
      invalidatesTags: ["pm"],
    }),
    getAssignableProviders: builder.query({
      query: () => "/pm/assignable-providers",
      providesTags: ["providers"],
    }),
  }),
});

export const {
  useGetPmProjectsQuery,
  useGetPmProjectQuery,
  useGetPmEligibleQuery,
  useCreatePmProjectMutation,
  useUpdatePmProjectMutation,
  useDeletePmProjectMutation,
  useGetPmStagesQuery,
  useCreatePmStageMutation,
  useUpdatePmStageMutation,
  useReorderPmStagesMutation,
  useDeletePmStageMutation,
  useCreatePmTaskMutation,
  useUpdatePmTaskMutation,
  useDeletePmTaskMutation,
  useCreatePmBugMutation,
  useUpdatePmBugMutation,
  useDeletePmBugMutation,
  useCreatePmMilestoneMutation,
  useUpdatePmMilestoneMutation,
  useDeletePmMilestoneMutation,
  useAddPmAttachmentMutation,
  useDeletePmAttachmentMutation,
  useGetAssignableProvidersQuery,
} = pmApi;
