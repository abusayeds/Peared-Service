"use client";

import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import { getImageUrl } from "../../lib/getImageUrl";
import { ymd } from "./pmUtils";

export default function ItemFormModal({
  open,
  onClose,
  onSubmit,
  loading,
  initial,
  kind = "task",
  stages = [],
  people = [],
  defaultStageId,
}) {
  const [form] = Form.useForm();
  const isTask = kind === "task";

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue({
        title: initial.title,
        description: initial.description,
        priority: initial.priority || "Medium",
        stageId: initial.stageId?._id || initial.stageId,
        assignees: (initial.assignees || []).map((p) => p._id || p),
        category: initial.category,
        startDate: ymd(initial.startDate) === "—" ? "" : ymd(initial.startDate),
        endDate: ymd(initial.endDate) === "—" ? "" : ymd(initial.endDate),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        priority: "Medium",
        stageId: defaultStageId,
      });
    }
  }, [open, initial, form, defaultStageId]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({
      ...values,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
    });
  };

  return (
    <Modal
      title={
        <span className="text-lg font-semibold">
          {initial ? `Edit ${isTask ? "Task" : "Bug"}` : `Create ${isTask ? "Task" : "Bug"}`}
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
          <Input placeholder={`Enter ${kind} title`} />
        </Form.Item>
        <Form.Item name="priority" label="Priority">
          <Select
            options={[
              { value: "Low", label: "Low" },
              { value: "Medium", label: "Medium" },
              { value: "High", label: "High" },
            ]}
          />
        </Form.Item>
        <Form.Item name="assignees" label="Assign To">
          <Select
            mode="multiple"
            placeholder="Select team members"
            options={people.map((p) => ({ value: p._id, label: p.name }))}
            optionRender={(option) => {
              const p = people.find((x) => x._id === option.value);
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
        <Form.Item name="stageId" label="Status">
          <Select
            options={stages.map((s) => ({ value: s._id, label: s.name }))}
          />
        </Form.Item>
        {isTask && (
          <>
            <Form.Item name="category" label="Category">
              <Input placeholder="e.g. Production Deployment" />
            </Form.Item>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item name="startDate" label="Start">
                <Input type="date" />
              </Form.Item>
              <Form.Item name="endDate" label="End">
                <Input type="date" />
              </Form.Item>
            </div>
          </>
        )}
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} placeholder={`Enter ${kind} description`} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
