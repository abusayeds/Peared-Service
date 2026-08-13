"use client";

import { Button, Form, Input, InputNumber, Modal, Select, Spin, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Message from "../../../../components/project-details-message/Message";
import CatalogSelect from "../../../../components/utils/CatalogSelect";
import {
  useGetConversationMetaQuery,
} from "../../../../redux/features/chat/chatApi";
import { useCreateOfferMutation } from "../../../../redux/features/projects/projectApi";

export default function InboxConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.conversationId;
  const { user } = useSelector((state) => state.auth);
  const [offerOpen, setOfferOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useGetConversationMetaQuery(conversationId, {
    skip: !conversationId,
  });
  const [createOffer, { isLoading: sending }] = useCreateOfferMutation();

  const conversation = data?.data?.conversation;
  const pendingOffer = data?.data?.pendingOffer;

  const peer = useMemo(() => {
    if (!conversation) return null;
    return user?.role === "provider"
      ? conversation.userId
      : conversation.providerId;
  }, [conversation, user?.role]);

  const isDirect = conversation?.type === "direct" && !conversation?.projectId;
  const providerId =
    conversation?.providerId?._id || conversation?.providerId;

  const providerData = {
    data: {
      userName: peer?.name,
      userImage: peer?.image,
      currentProjects: {
        providerId: conversation?.providerId,
        projectId: conversation?.projectId
          ? { userId: conversation?.userId?._id || conversation?.userId }
          : null,
      },
    },
  };

  const handleSendOffer = async (values) => {
    try {
      await createOffer({
        providerId,
        conversationId,
        projectName: values.projectName,
        projectCategory: values.projectCategory,
        street: values.street,
        city: values.city,
        postCode: values.postCode,
        locationType: values.locationType,
        time: values.time,
        workDetails: values.workDetails,
        price: values.price,
        serviceTime: values.serviceTime,
      }).unwrap();
      message.success("Offer sent to provider");
      setOfferOpen(false);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error(
        err?.data?.message || err?.message || "Could not send offer"
      );
    }
  };

  if (isLoading || !conversation) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (conversation.projectId) {
    const projectId =
      conversation.projectId?._id || conversation.projectId;
    router.replace(
      `/profile/project-details-message?projectId=${projectId}`
    );
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {user?.role === "user" && isDirect && (
        <div className="px-3 sm:px-4 py-2 bg-secondary border-b border-hash/30 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-700">
            Agree on price in chat, then send a formal offer.
          </p>
          <Button
            type="primary"
            className="bg-primary"
            onClick={() => setOfferOpen(true)}
            disabled={!!pendingOffer}
          >
            {pendingOffer ? "Offer pending" : "Send offer"}
          </Button>
        </div>
      )}

      {user?.role === "provider" && pendingOffer && (
        <div className="px-3 sm:px-4 py-2 bg-secondary border-b border-hash/30 text-sm text-gray-700">
          You have a pending offer — accept it from{" "}
          <button
            type="button"
            className="text-primary font-semibold underline"
            onClick={() => router.push("/profile/my-bids")}
          >
            Pending Bids
          </button>
          .
        </div>
      )}

      <div className="flex-1 min-h-0">
        <Message
          conversationId={conversationId}
          userId={user?._id}
          providerData={providerData}
          providerId={providerId}
          peerUserId={peer?._id}
          isDirect
          hideProjectActions
        />
      </div>

      <Modal
        title="Send offer to provider"
        open={offerOpen}
        onCancel={() => setOfferOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendOffer}
          initialValues={{ locationType: "Home", time: "Within 2 weeks" }}
        >
          <Form.Item
            name="projectName"
            label="Project name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g. Kitchen sink repair" />
          </Form.Item>
          <Form.Item
            name="projectCategory"
            label="Service"
            rules={[{ required: true, message: "Required" }]}
          >
            <CatalogSelect
              mode="single"
              type="service"
              placeholder="Select or add service"
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="price"
              label="Agreed price ($)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item
              name="serviceTime"
              label="Days"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="street" label="Street" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="city" label="City" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="postCode"
              label="Post code"
              rules={[
                { required: true },
                { pattern: /^\d{5}$/, message: "5 digits" },
              ]}
            >
              <Input maxLength={5} />
            </Form.Item>
          </div>
          <Form.Item name="locationType" label="Location type">
            <Select
              options={[
                { value: "Home", label: "Home" },
                { value: "Business", label: "Business" },
              ]}
            />
          </Form.Item>
          <Form.Item name="time" label="Timeline">
            <Select
              options={[
                { value: "Urgent(1 - 2 days)", label: "Urgent (1–2 days)" },
                { value: "Within 2 weeks", label: "Within 2 weeks" },
                { value: "More than 2 weeks", label: "More than 2 weeks" },
                {
                  value: "Not sure - still planning",
                  label: "Not sure — still planning",
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="workDetails"
            label="Work details"
            rules={[{ required: true, min: 20 }]}
          >
            <Input.TextArea rows={4} placeholder="What was agreed in chat…" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={sending}
            className="w-full bg-primary"
          >
            Send offer
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
