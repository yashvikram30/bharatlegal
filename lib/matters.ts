export function formatMatter(matter: any) {
  return {
    id: matter._id.toString(),
    title: matter.title,
    category: matter.category,
    status: matter.status,
    summary: matter.summary || "",
    nextAction: matter.nextAction || "Decide your next step",
    nextActionDue: matter.nextActionDue ? new Date(matter.nextActionDue).toISOString() : null,
    checklist: (matter.checklist || []).map((item: any) => ({ text: item.text, completed: Boolean(item.completed) })),
    createdAt: new Date(matter.createdAt).toISOString(),
    updatedAt: new Date(matter.updatedAt).toISOString(),
  };
}
