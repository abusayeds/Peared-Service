"use client";

import { Dropdown } from "antd";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaEllipsisH } from "react-icons/fa";
import AvatarStack from "./AvatarStack";
import { money, statusMeta, ymd } from "./pmUtils";

export default function ProjectCard({ project, isProvider, onRemove }) {
  const router = useRouter();
  const st = statusMeta[project.status] || statusMeta.ongoing;
  const percent = project.progress?.percent || 0;
  const done = project.progress?.done || 0;
  const total = project.progress?.total || 0;
  const people = isProvider
    ? [project.ownerId].filter(Boolean)
    : project.assignedTo || [];

  const menuItems = [
    { key: "view", label: "View" },
    ...(!isProvider
      ? [{ key: "listing", label: "Open listing" }]
      : []),
    { key: "remove", label: <span className="text-red-600">Remove</span> },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col min-h-[210px]">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => router.push(`/profile/project-manage/${project._id}`)}
          className="text-left font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-primary"
        >
          {project.title}
        </button>
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => {
              if (key === "view") router.push(`/profile/project-manage/${project._id}`);
              if (key === "listing")
                router.push(`/profile/my-projects/${project._id}`);
              if (key === "remove") onRemove?.(project);
            },
          }}
          trigger={["click"]}
        >
          <button
            type="button"
            className="p-2 -mr-1 text-gray-500 hover:text-primary min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Project actions"
          >
            <FaEllipsisH />
          </button>
        </Dropdown>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          {done}/{total}{" "}
          <span className="text-gray-400">({percent}% completed)</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${project.overdue ? "bg-red-500" : st.bar}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-gray-400 mb-1">
            {isProvider ? "Assigned by" : "Assigned to"}
          </p>
          <AvatarStack people={people} />
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-400 mb-1">Deadline</p>
          <p
            className={`text-xs font-medium flex items-center gap-1 ${
              project.overdue ? "text-red-500" : "text-gray-600"
            }`}
          >
            <FaCalendarAlt className="text-red-400" />
            {ymd(project.deadline)}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${st.badge}`}>
          {st.label}
        </span>
        <span className="font-semibold text-gray-800 text-sm">
          {project.budgetLabel || money(project.budget)}
        </span>
      </div>
    </div>
  );
}
