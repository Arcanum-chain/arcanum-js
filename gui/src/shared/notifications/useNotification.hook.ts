import { notification } from "antd";
import { useEffect } from "react";

interface Props {
  readonly error?: string;
  readonly isSuccess: boolean;
  readonly sucText: string;
  readonly errorText?: string;
  readonly isError?: boolean;
  readonly okCb?: (() => void) | (() => Promise<void>);
}

export const useNotifications = (props: Props) => {
  const [natifApi, context] = notification.useNotification();

  const showMsg = ({
    isSuccess,
    error,
    isError,
  }: Pick<Props, "error" | "isSuccess" | "isError">) => {
    if (isSuccess) {
      natifApi.success({
        type: "success",
        message: props.sucText,
      });
    } else if (error || isError) {
      natifApi.error({
        type: "error",
        message: props.errorText ?? error ?? "Error",
      });
    }
  };

  useEffect(() => {
    showMsg({
      isSuccess: props.isSuccess,
      isError: props.isError,
      error: props.error,
    });
  }, [props.isError, props.isSuccess, props.error]);
};
