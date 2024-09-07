import React from "react";

import { Button, Flex, Row, Typography } from "antd";

import { useCreateWalletForm } from "../logic/useCreateWalletForm.model";

import "../assets/style.css";

export const CreateWalletFormFeature: React.FC = () => {
  const { submit, isPending } = useCreateWalletForm();

  return (
    <Flex
      justify="center"
      align="center"
      style={{ width: "100%", paddingTop: "30%" }}
    >
      <Row gutter={[32, 16]} className="create_acc_card">
        <Typography.Text style={{ fontSize: "25px", fontWeight: "700px" }}>
          Create REI Wallet
        </Typography.Text>
        <Button
          type="primary"
          style={{ width: "100%" }}
          disabled={isPending}
          onClick={submit}
        >
          Create
        </Button>
      </Row>
    </Flex>
  );
};
