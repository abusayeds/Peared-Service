"use client";

import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import { getImageUrl } from "../../lib/getImageUrl";
import { useGetAssignableProvidersQuery } from "../../redux/features/pm/pmApi";
import { ymd } from "./pmUtils";

export default function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  loading,
  initial,
}) {
  const [form] = Form.useForm();
  const { data } = useGetAssignableProvidersQuery();
  const providers = data?.data || [];

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue({
        title: initial.title,
        description: initial.description,
        budget: initial.budget,
        status: initial.status || "ongoing",
        assignedTo: (initial.assignedTo || []).map((p) => p._id || p),
        startDate: ymd(initial.startDate) === "—" ? "" : ymd(initial.startDate),
        deadline: ymd(initial.deadline) === "—" ? "" : ymd(initial.deadline),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "ongoing" });
    }
  }, [open, initial, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      ...values,
      budget: Number(values.budget) || 0,
      startDate: values.startDate || undefined,
      deadline: values.deadline || undefined,
    });
  };

  return (
    <Modal
      title={
        <span className="text-lg font-semibold">
          {initial ? "Edit Project" : "Create Project"}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={initial ? "Save" : "Create"}
      confirmLoading={loading}
      okButtonProps={{
        className: "!bg-primary !border-primary hover:!bg-primary/90",
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter project title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Enter project description" />
        </Form.Item>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item name="budget" label="Budget">
            <Input type="number" min={0} placeholder="0" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              options={[
                { value: "ongoing", label: "Ongoing" },
                { value: "onhold", label: "On Hold" },
                { value: "finished", label: "Finished" },
              ]}
            />
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item name="startDate" label="Start Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: "Deadline is required" }]}
          >
            <Input type="date" />
          </Form.Item>
        </div>
        <Form.Item
          name="assignedTo"
          label="Assign To"
          rules={[{ required: true, message: "Select at least one provider" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select providers"
            optionFilterProp="label"
            options={providers.map((p) => ({
              value: p._id,
              label: p.name,
            }))}
            optionRender={(option) => {
              const p = providers.find((x) => x._id === option.value);
              return (
                <div className="flex items-center gap-2">
                  <img
                    src={getImageUrl(p?.image)}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{p?.name}</span>
                </div>
              );
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
