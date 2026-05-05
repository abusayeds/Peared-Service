"use client";

import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { mainTheme } from "../components/utils/antTheme";
import { useGetUserDataQuery } from "../redux/features/userApi";
import { setCredentials } from "../redux/slices/authSlice";

const ThemeProvider = ({ children }) => {
  const { data } = useGetUserDataQuery(undefined);
  const dispatch = useDispatch();

  // console.log(data?.data, isLoading);

  useEffect(() => {
    dispatch(
      setCredentials({
        user: data?.data,
        token: "",
      })
    );
  }, [data?.data, dispatch]);

  return (
    <>
      <ConfigProvider theme={mainTheme}>{children}</ConfigProvider>
    </>
  );
};

export default ThemeProvider;
