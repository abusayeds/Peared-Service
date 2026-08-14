"use client";

import { Checkbox, Form, Input, Modal } from "antd";
import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";

const PRESETS = [
  "#5E9A2D",
  "#93BB72",
  "#60A5FA",
  "#9CA3AF",
  "#22D3EE",
  "#22C55E",
  "#3B82F6",
  "#A855F7",
  "#06B6D4",
  "#374151",
  "#F59E0B",
  "#EF4444",
];

export default function StageSetup({
  title,
  stages = [],
  onCreate,
  onUpdate,
  onDelete,
  creating,
}) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const colorWatch = Form.useWatch("color", form) || "#5E9A2D";

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({ name: "", color: "#5E9A2D", isDone: false });
    setOpen(true);
  };

  const openEdit = (stage) => {
    setEditing(stage);
    form.setFieldsValue({
      name: stage.name,
      color: stage.color || "#5E9A2D",
      isDone: !!stage.isDone,
    });
    setOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.name.trim(),
      color: values.color || "#5E9A2D",
      isDone: !!values.isDone,
    };
    if (editing) await onUpdate(editing._id, payload);
    else await onCreate(payload);
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={openCreate}
          disabled={creating}
          className="w-10 h-10 rounded-md bg-primary text-white flex items-center justify-center"
          aria-label={`Add ${title}`}
        >
          <FaPlus size={12} />
        </button>
      </div>
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <div
            key={stage._id}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
              stage.isDone ? "border-primary/40 bg-secondary/40" : "border-gray-200"
            }`}
          >
            <MdDragIndicator className="text-gray-400 shrink-0" />
            <span
              className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: stage.color || "#5E9A2D" }}
            >
              {i + 1}
            </span>
            <span
              className="w-4 h-4 rounded-sm shrink-0 border border-black/10"
              style={{ backgroundColor: stage.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{stage.name}</p>
              {stage.isDone && (
                <p className="text-[11px] text-primary">Done stage</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => openEdit(stage)}
              className="p-2 text-sky-600 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Edit stage"
            >
              <FaEdit />
            </button>
            <button
              type="button"
              onClick={() => onDelete(stage)}
              className="p-2 text-red-500 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Delete stage"
            >
              <FaTrash />
            </button>
          </div>
        ))}
        {stages.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">
            No stages yet. Add one with a color.
          </p>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? `Edit ${title}` : `Create ${title}`}
        okText={editing ? "Save" : "Create"}
        okButtonProps={{ className: "!bg-primary !border-primary" }}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onOk={handleOk}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-3">
          <Form.Item
            name="name"
            label="Stage name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g. In Progress" />
          </Form.Item>
          <Form.Item
            name="color"
            label="Color code"
            rules={[{ required: true, message: "Pick a color" }]}
            initialValue="#5E9A2D"
          >
            <Input className="hidden" />
          </Form.Item>
          <div className="-mt-4 mb-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={
                  /^#[0-9A-Fa-f]{6}$/.test(colorWatch)
                    ? colorWatch
                    : "#5E9A2D"
                }
                onChange={(e) => form.setFieldValue("color", e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border border-gray-200 p-0.5 bg-white shrink-0"
                aria-label="Pick color"
              />
              <Input
                value={colorWatch}
                onChange={(e) => form.setFieldValue("color", e.target.value)}
                placeholder="#5E9A2D"
                className="font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  title={hex}
                  onClick={() => form.setFieldValue("color", hex)}
                  className={`w-7 h-7 rounded-md border ${
                    colorWatch?.toLowerCase() === hex.toLowerCase()
                      ? "ring-2 ring-primary ring-offset-1"
                      : "border-black/10"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
          <Form.Item name="isDone" valuePropName="checked">
            <Checkbox>Mark as Done stage (completed tasks/bugs)</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
