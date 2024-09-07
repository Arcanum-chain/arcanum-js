import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { AppRoutes } from "./app.routes";
import { ModelRoutes } from "./model.routes";

export const RoutesWrapper: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (window.location.pathname.includes("/main_window")) {
      navigate(AppRoutes.CREATE_ACC);
    }
  }, []);

  return (
    <Routes>
      {ModelRoutes.map(({ Page, path }) => (
        <Route path={path} Component={Page} key={path} />
      ))}
    </Routes>
  );
};
