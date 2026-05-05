import { baseApi } from "../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 01. join as provider
    joinAsProvider: builder.mutation({
      query: (providerData) => {
        console.log("MU DATA", providerData);
        return {
          url: "/user/join-provider",
          method: "POST",
          body: providerData,
        };
      },
    }),

    // 02. signup
    signup: builder.mutation({
      query: (userData) => ({
        url: "/user/register",
        method: "POST",
        body: userData,
      }),
    }),

    // 03. login
    login: builder.mutation({
      query: (credentials) => ({
        url: "/user/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // 04. forgot password
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/user/forget-password",
        method: "POST",
        body,
      }),
    }),

    // 05. reset password
    resetPassword: builder.mutation({
      query: ({ body }) => ({
        url: "/user/reset-password",
        method: "POST",
        body,
      }),
    }),

    // 06.  verify forgot password
    verifyForgetOtp: builder.mutation({
      query: ({ otp }) => {
        return {
          url: "/user/verify-forget-otp",
          method: "POST",
          body: { otp },
        };
      },
    }),

    // 07. resend OTP
    resendOtp: builder.mutation({
      query: (email) => ({
        url: `/user/resend?email=${encodeURIComponent(email)}`,
        method: "POST",
      }),
    }),

    // 08. verify email
    verifyEmail: builder.mutation({
      query: (email) => ({
        url: `/user/verify-email?email=${encodeURIComponent(email)}`,
        method: "POST",
      }),
    }),

    // 09. change password
    changePassword: builder.mutation({
      query: (body) => ({
        url: "/user/change-password",
        method: "POST",
        body,
      }),
    }),

    // 10. delete account
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/user/delete",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useJoinAsProviderMutation,
  useSignupMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyForgetOtpMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useDeleteAccountMutation,
} = authApi;
