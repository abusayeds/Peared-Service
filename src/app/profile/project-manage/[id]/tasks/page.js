"use client";

import KanbanPage from "../KanbanPage";

export default function TaskKanban({ params }) {
  return <KanbanPage params={params} kind="task" />;
}
