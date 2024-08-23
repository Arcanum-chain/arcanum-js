/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from "react";

interface Props {
  readonly msg: string;
  readonly payload: unknown;
}

export function useSendElectronApiMsg<ResData>() {
  const [data, setData] = useState<ResData>();

  const send = async ({ msg, payload }: Props) => {
    try {
      // @ts-expect-error
      const res = await window.electronAPI.sendMessageToMainProcess(
        msg,
        payload
      );

      setData(res);
    } catch (e) {
      console.log(e);
    }
  };

  return {
    data,
    send,
  };
}
