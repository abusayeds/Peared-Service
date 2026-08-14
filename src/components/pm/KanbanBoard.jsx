"use client";

import { Dropdown } from "antd";
import { FaCalendarAlt, FaEllipsisH, FaPlus } from "react-icons/fa";
import AvatarStack from "./AvatarStack";
import { priorityMeta, ymd } from "./pmUtils";

function KanbanCard({ item, onView, onEdit, onDelete }) {
  const overdue =
    item.endDate &&
    new Date(item.endDate).getTime() < Date.now() &&
    !item.stageId?.isDone;
  const items = [
    { key: "view", label: "View" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: <span className="text-red-600">Delete</span> },
  ];

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("itemId", item._id);
      }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-gray-900 leading-snug">
          {item.title}
        </p>
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              if (key === "view") onView?.(item);
              if (key === "edit") onEdit?.(item);
              if (key === "delete") onDelete?.(item);
            },
          }}
          trigger={["click"]}
        >
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-primary min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <FaEllipsisH />
          </button>
        </Dropdown>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {item.priority && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              priorityMeta[item.priority] || priorityMeta.Medium
            }`}
          >
            {item.priority}
          </span>
        )}
        {overdue && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">
            Overdue
          </span>
        )}
        {item.category && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700">
            {item.category}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <AvatarStack people={item.assignees} size={24} max={3} />
        {(item.startDate || item.endDate) && (
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <FaCalendarAlt />
            {ymd(item.startDate)} {item.endDate ? `- ${ymd(item.endDate)}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({
  stages = [],
  items = [],
  onMove,
  onAdd,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
      {stages.map((stage) => {
        const colItems = items.filter(
          (it) => String(it.stageId?._id || it.stageId) === String(stage._id)
        );
        return (
          <div
            key={stage._id}
            className="min-w-[260px] w-[280px] shrink-0 rounded-2xl p-3"
            style={{ backgroundColor: `${stage.color}18` }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const itemId = e.dataTransfer.getData("itemId");
              if (itemId) onMove?.(itemId, stage._id);
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="font-semibold text-sm text-gray-800">
                {stage.name}
              </span>
              <span className="text-[11px] bg-white/80 px-1.5 rounded-full text-gray-600">
                {colItems.length}
              </span>
              <button
                type="button"
                onClick={() => onAdd?.(stage._id)}
                className="ml-auto p-1.5 text-gray-500 hover:text-primary min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label={`Add to ${stage.name}`}
              >
                <FaPlus size={12} />
              </button>
            </div>
            <div className="space-y-2 min-h-[140px]">
              {colItems.map((item) => (
                <KanbanCard
                  key={item._id}
                  item={item}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {colItems.length === 0 && (
                <div className="h-28 rounded-xl border border-dashed border-gray-300/80 flex flex-col items-center justify-center text-gray-400 text-xs">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
