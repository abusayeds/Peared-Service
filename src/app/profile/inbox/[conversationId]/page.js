"use client";

import { Button, Form, Input, InputNumber, Modal, Select, Spin, Tag, message } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Message from "../../../../components/project-details-message/Message";
import CatalogSelect from "../../../../components/utils/CatalogSelect";
import {
  useGetConversationMetaQuery,
  useMarkChatReadMutation,
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
  const [markRead] = useMarkChatReadMutation();

  const conversation = data?.data?.conversation;
  const projects = data?.data?.projects || [];
  const pendingOffers = data?.data?.pendingOffers || [];

  useEffect(() => {
    if (!conversationId || !user) return;
    markRead(conversationId);
  }, [conversationId, user, markRead]);

  const peer = useMemo(() => {
    if (!conversation) return null;
    return user?.role === "provider"
      ? conversation.userId
      : conversation.providerId;
  }, [conversation, user?.role]);

  const providerId =
    conversation?.providerId?._id || conversation?.providerId;

  const providerData = {
    data: {
      userName: peer?.name,
      userImage: peer?.image,
      currentProjects: {
        providerId: conversation?.providerId,
        projectId: null,
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

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <div className="px-3 sm:px-4 py-2 bg-secondary border-b border-hash/30 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-700">
            {user?.role === "user"
              ? "Chat here anytime. You can send multiple offers."
              : "Chat with your client. Accept offers from Pending Bids."}
          </p>
          {user?.role === "user" && (
            <Button
              type="primary"
              className="bg-primary"
              onClick={() => setOfferOpen(true)}
            >
              Send offer
            </Button>
          )}
          {user?.role === "provider" && pendingOffers.length > 0 && (
            <Button onClick={() => router.push("/profile/my-bids")}>
              {pendingOffers.length} pending offer
              {pendingOffers.length > 1 ? "s" : ""}
            </Button>
          )}
        </div>

        {projects.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-500 mr-1">Projects:</span>
            {projects.map((p) => (
              <Link
                key={p.projectId}
                href={
                  p.status === "running" || p.status === "complete"
                    ? `/profile/project-details-message?projectId=${p.projectId}`
                    : "/profile/my-bids"
                }
                className="inline-flex"
              >
                <Tag
                  color={
                    p.status === "running"
                      ? "green"
                      : p.status === "pending"
                        ? "orange"
                        : "default"
                  }
                  className="cursor-pointer m-0"
                >
                  {p.projectName || p.projectCategory}
                  {p.status ? ` · ${p.status}` : ""}
                </Tag>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No projects yet — just chatting.</p>
        )}
      </div>

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
