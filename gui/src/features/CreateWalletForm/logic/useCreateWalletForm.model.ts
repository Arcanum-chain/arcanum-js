import { useEffect } from "react";

import { notification } from "antd";

import { useCreateWalletMutation } from "../../../shared";

export const useCreateWalletForm = () => {
  const [natifApi, context] = notification.useNotification();
  const { mutate, isPending, isSuccess, error, data } =
    useCreateWalletMutation();

  const submit = () => {
    mutate();
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  return {
    submit,
    isPending,
  };
};
