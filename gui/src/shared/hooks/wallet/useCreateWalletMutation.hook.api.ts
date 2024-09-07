import { useMutation } from "@tanstack/react-query";

import { WalletApiService } from "../../index";

export const useCreateWalletMutation = () => {
  return useMutation({
    mutationFn: async () => await new WalletApiService().createWallet(),
    mutationKey: ["createWallet"],
  });
};
