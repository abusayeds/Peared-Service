"use client";

import Image from "next/image";
import { FaInfoCircle } from "react-icons/fa";
import { getImageUrl } from "../../lib/getImageUrl";

function statusLabel(status) {
  if (status === "complete") return "Awaiting review";
  if (status === "running") return "In progress";
  return status || "—";
}

function ProjectCard({
  project,
  role,
  onDone,
  onOk,
  onNotOk,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-hash/20">
      {project.image && (
        <div className="relative w-full h-28 bg-secondary">
          <Image
            src={getImageUrl(project.image)}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-gray-900 leading-snug">
            {project.projectName}
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-primary font-medium shrink-0">
            {statusLabel(project.status)}
          </span>
        </div>
        {project.projectCategory && (
          <p className="text-xs text-gray-500">{project.projectCategory}</p>
        )}
        <div className="text-xs space-y-1 text-gray-600">
          <p className="flex justify-between">
            <span>Price</span>
            <span className="font-semibold text-primary">${project.price}</span>
          </p>
          {project.serviceTime ? (
            <p className="flex justify-between">
              <span>Time</span>
              <span>{project.serviceTime} Days</span>
            </p>
          ) : null}
          {(project.city || project.street) && (
            <p className="text-gray-500 truncate">
              {[project.street, project.city, project.postCode]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        {role === "user" ? (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 mb-2">
              {project.status !== "complete"
                ? "Unlocks when provider marks done."
                : "Confirm this project is complete."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNotOk(project)}
                disabled={project.status !== "complete"}
                className="flex-1 border border-red-300 text-red-600 text-sm py-2 rounded-lg font-medium disabled:opacity-40 min-h-[40px]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => onOk(project)}
                disabled={project.status !== "complete"}
                className="flex-1 bg-primary text-white text-sm py-2 rounded-lg font-medium disabled:opacity-40 min-h-[40px]"
              >
                Yes
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 mb-2">
              Mark this project done for the client to review.
            </p>
            <button
              type="button"
              onClick={() => onDone(project)}
              disabled={project.status === "complete"}
              className="w-full bg-primary text-white text-sm py-2.5 rounded-lg font-medium disabled:opacity-40 min-h-[40px]"
            >
              {project.status === "complete" ? "Request sent" : "Mark as Done"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InboxProjectPanel({
  role,
  activeProjects = [],
  pendingCount = 0,
  onSendOffer,
  onOpenBids,
  onDone,
  onOk,
  onNotOk,
}) {
  const hasRunning = activeProjects.length > 0;
  const sendOfferBtn =
    role === "user" ? (
      <button
        type="button"
        onClick={onSendOffer}
        className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg min-h-[44px]"
      >
        Send offer
      </button>
    ) : pendingCount > 0 ? (
      <button
        type="button"
        onClick={onOpenBids}
        className="w-full border border-primary text-primary font-semibold py-2.5 rounded-lg min-h-[44px]"
      >
        {pendingCount} pending offer{pendingCount > 1 ? "s" : ""}
      </button>
    ) : null;

  return (
    <aside className="h-full min-h-0 flex flex-col bg-[#f7f8fa] border-l border-hash/30">
      <div className="shrink-0 h-[56px] px-4 flex items-center justify-between border-b border-hash/30">
        <h2 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
          <FaInfoCircle className="text-primary" /> Projects
        </h2>
        <span className="text-[11px] text-gray-500">
          {activeProjects.length} active
        </span>
      </div>

      {!hasRunning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
          <p className="text-sm text-gray-500 mb-4 max-w-[220px]">
            {role === "user"
              ? "No running project yet. Send an offer from this chat."
              : "No running project yet. Offers appear in Pending Bids."}
          </p>
          {sendOfferBtn}
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
          {sendOfferBtn && <div className="sticky top-0 z-10 bg-[#f7f8fa] pb-1">{sendOfferBtn}</div>}
          {activeProjects.map((p) => (
            <ProjectCard
              key={p.bitId}
              project={p}
              role={role}
              onDone={onDone}
              onOk={onOk}
              onNotOk={onNotOk}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
