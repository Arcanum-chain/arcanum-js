import axios from "axios";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const apiInstance = axios.create({
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: "http://localhost:4001",
});
