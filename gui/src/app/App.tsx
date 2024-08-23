import React from "react";

import { useSendElectronApiMsg } from "../shared";

export const App: React.FC = () => {
  const { send, data } = useSendElectronApiMsg<string>();

  const test = async () => {
    send({ msg: "someChannelName", payload: "../../../.env" });
    console.log(data);
  };

  return (
    <main>
      App <button onClick={test}>OnClick</button>
    </main>
  );
};
