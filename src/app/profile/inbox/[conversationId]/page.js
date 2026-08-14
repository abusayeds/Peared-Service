"use client";

import { Button, Form, Input, InputNumber, Modal, Select, Spin, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import InboxProjectPanel from "../../../../components/inbox/InboxProjectPanel";
import Message from "../../../../components/project-details-message/Message";
import CatalogSelect from "../../../../components/utils/CatalogSelect";
import { ErrorSwal, SuccessSwal } from "../../../../components/utils/allSwalFire";
import { useSocket } from "../../../../context/SocketContext";
import {
  useGetConversationMetaQuery,
  useMarkChatReadMutation,
} from "../../../../redux/features/chat/chatApi";
import {
  useCreateOfferMutation,
  useProjectDoneByProviderMutation,
  useProjectNotOkByUserMutation,
  useProjectOkByUserMutation,
} from "../../../../redux/features/projects/projectApi";

const isActiveProject = (p) =>
  p?.status === "running" || p?.status === "complete";

export default function InboxConversationPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const conversationId = params?.conversationId;
  const { user } = useSelector((state) => state.auth);
  const [offerOpen, setOfferOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useGetConversationMetaQuery(conversationId, {
    skip: !conversationId,
  });
  const [createOffer, { isLoading: sending }] = useCreateOfferMutation();
  const [markRead] = useMarkChatReadMutation();
  const [projectOk] = useProjectOkByUserMutation();
  const [projectNotOk] = useProjectNotOkByUserMutation();
  const [projectDone] = useProjectDoneByProviderMutation();

  const conversation = data?.data?.conversation;
  const projects = data?.data?.projects || [];
  const pendingOffers = data?.data?.pendingOffers || [];
  const activeProjects = useMemo(
    () => (projects || []).filter(isActiveProject),
    [projects]
  );

  useEffect(() => {
    if (!conversationId || !user) return;
    markRead(conversationId);
  }, [conversationId, user, markRead]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => refetch();
    socket.on("project:providerDone", refresh);
    socket.on("project:userOk", refresh);
    socket.on("project:userNotOk", refresh);
    socket.on("bid:approved", refresh);
    return () => {
      socket.off("project:providerDone", refresh);
      socket.off("project:userOk", refresh);
      socket.off("project:userNotOk", refresh);
      socket.off("bid:approved", refresh);
    };
  }, [socket, refetch]);

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

  const handleOk = async (project) => {
    try {
      await projectOk(project.bitId).unwrap();
      SuccessSwal({ title: "", text: "Project completed successfully!" });
      refetch();
      router.push(`/feedback?providerId=${providerId}`);
    } catch (err) {
      ErrorSwal({
        title: "",
        text: err?.data?.message || err?.message || "Failed",
      });
    }
  };

  const handleNotOk = async (project) => {
    try {
      const response = await projectNotOk(project.bitId).unwrap();
      ErrorSwal({
        title: "",
        text: response?.message || "Work marked as not complete",
      });
      refetch();
    } catch (err) {
      ErrorSwal({
        title: "",
        text: err?.data?.message || err?.message || "Failed",
      });
    }
  };

  const handleDone = async (project) => {
    try {
      await projectDone(project.bitId).unwrap();
      SuccessSwal({ title: "", text: "Done request sent to client!" });
      refetch();
    } catch (err) {
      ErrorSwal({
        title: "",
        text: err?.data?.message || err?.message || "Failed",
      });
    }
  };

  if (isLoading || !conversation) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  const panel = (
    <InboxProjectPanel
      role={user?.role}
      activeProjects={activeProjects}
      pendingCount={pendingOffers.length}
      onSendOffer={() => setOfferOpen(true)}
      onOpenBids={() => router.push("/profile/my-bids")}
      onDone={handleDone}
      onOk={handleOk}
      onNotOk={handleNotOk}
    />
  );

  return (
    <div className="h-[calc(100vh-5rem)] pb-16 md:pb-0 flex overflow-hidden bg-secondary">
      <div className="relative flex-1 min-w-0 min-h-0 flex flex-col">
        <Message
          conversationId={conversationId}
          userId={user?._id}
          providerData={providerData}
          providerId={providerId}
          peerUserId={peer?._id}
          isDirect
          hideProjectActions
        />
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          className="lg:hidden absolute top-[14px] right-3 z-20 h-9 w-9 rounded-full bg-white/90 text-primary shadow flex items-center justify-center"
          title="Projects"
        >
          <FaInfoCircle size={16} />
        </button>
      </div>

      <div className="hidden lg:flex w-[300px] xl:w-[340px] shrink-0 h-full min-h-0 flex-col">
        {panel}
      </div>

      {showPanel && (
        <div className="lg:hidden fixed inset-0 z-[60] flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close"
            onClick={() => setShowPanel(false)}
          />
          <div className="relative w-[min(100%,360px)] h-full shadow-2xl bg-white">
            {panel}
          </div>
        </div>
      )}

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
