import React from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { RoutesWrapper } from "./routes/routes.wrapper";

import { queryClient } from "../shared";

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RoutesWrapper />
    </QueryClientProvider>
  );
};
