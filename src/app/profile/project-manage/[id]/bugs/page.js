"use client";

import KanbanPage from "../KanbanPage";

export default function BugKanban({ params }) {
  return <KanbanPage params={params} kind="bug" />;
}
