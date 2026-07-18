"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Plus, X } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import type {
  CapstoneDTO,
  CapstoneResourceDTO,
  CheckDTO,
  CourseDTO,
  ItemDTO,
  ModuleDTO,
  QuestionDTO,
  ResourceDTO,
  TopicDTO,
} from "./types";
import {
  createTopic,
  renameTopic,
  deleteTopic,
  reorderTopics,
  moveModules,
  createModule,
  renameModule,
  deleteModule,
  attachResource,
  detachItem,
  renameItem,
  deleteResource,
  moveItems,
  createVideoCheck,
  updateVideoCheck,
  deleteVideoCheck,
  createExam,
  createExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  saveCapstone,
  deleteCapstone,
  deleteCapstoneResource,
  type VideoCheckInput,
  type McqInput,
  type CapstoneInput,
} from "../actions";
import { CapstoneCard } from "./capstone-editor";
import { OverviewCard } from "./overview-editor";
import { ItemRowPreview, ModulePreview } from "./module-card";
import { SortableTopicCard, TopicPreview } from "./topic-card";
import { ResourceLibrary, LibraryRowPreview } from "./resource-library";
import { InspectorPanel } from "./inspector-panel";
import {
  ConfirmDeleteDialog,
  type DeleteConfirm,
} from "@/app/(dashboard)/_components/confirm-delete-dialog";

const TOPIC = "topic-";
const TOPICDROP = "topicdrop-";
const MOD = "mod-";
const ITEM = "item-";
const LIB = "lib-";
const MODDROP = "moddrop-";

type Props = {
  course: CourseDTO;
  initialTopics: TopicDTO[];
  library: ResourceDTO[];
  initialChecks: Record<number, CheckDTO[]>;
  initialCapstone: CapstoneDTO | null;
  initialOverview: string | null;
};

export function BuilderClient({
  course,
  initialTopics,
  library: initialLibrary,
  initialChecks,
  initialCapstone,
  initialOverview,
}: Props) {
  const [topics, setTopics] = useState<TopicDTO[]>(initialTopics);
  const [library, setLibrary] = useState<ResourceDTO[]>(initialLibrary);
  const [checksByResource, setChecksByResource] =
    useState<Record<number, CheckDTO[]>>(initialChecks);
  const [selectedItemID, setSelectedItemID] = useState<number | null>(null);
  const [collapsedTopics, setCollapsedTopics] = useState<Record<number, boolean>>({});
  const [collapsedModules, setCollapsedModules] = useState<Record<number, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [creatingModuleTopicID, setCreatingModuleTopicID] = useState<number | null>(null);
  const [creatingExamModuleID, setCreatingExamModuleID] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<
    (DeleteConfirm & { action: () => void }) | null
  >(null);
  const [capstone, setCapstone] = useState<CapstoneDTO | null>(initialCapstone);
  const [deletingResourceIDs, setDeletingResourceIDs] = useState<Set<number>>(
    new Set()
  );
  const [deletingCapstoneResourceIDs, setDeletingCapstoneResourceIDs] = useState<
    Set<number>
  >(new Set());
  const tempCounter = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const selected: { item: ItemDTO; module: ModuleDTO } | null = (() => {
    if (selectedItemID == null) return null;
    for (const t of topics) {
      for (const m of t.modules) {
        const item = m.items.find((i) => i.itemID === selectedItemID);
        if (item) return { item, module: m };
      }
    }
    return null;
  })();

  /* ------------------------- persistence helpers ------------------------- */

  function withRollback(
    snapshot: TopicDTO[],
    action: () => Promise<{ ok: boolean; error?: string }>
  ) {
    action()
      .then((res) => {
        if (!res.ok) {
          setTopics(snapshot);
          setError(res.error ?? "Something went wrong — changes were undone.");
        }
      })
      .catch(() => {
        setTopics(snapshot);
        setError("Couldn't reach the server — changes were undone.");
      });
  }

  /* ------------------------------ topic CRUD ------------------------------ */

  async function handleAddTopic() {
    setCreatingTopic(true);
    const title = `Topic ${topics.length + 1}`;
    try {
      const res = await createTopic(course.courseID, title);
      if (res.ok && res.data) {
        setTopics((prev) => [
          ...prev,
          { topicID: res.data!.topicID, title, modules: [] },
        ]);
      } else if (!res.ok) {
        setError(res.error);
      }
    } catch {
      setError("Couldn't create the topic.");
    } finally {
      setCreatingTopic(false);
    }
  }

  function handleRenameTopic(topicID: number, title: string) {
    const snapshot = topics;
    setTopics((prev) =>
      prev.map((t) => (t.topicID === topicID ? { ...t, title } : t))
    );
    withRollback(snapshot, () => renameTopic(topicID, title));
  }

  function handleDeleteTopic(topicID: number) {
    const topic = topics.find((t) => t.topicID === topicID);
    if (!topic) return;
    const moduleCount = topic.modules.length;
    const itemCount = topic.modules.reduce((sum, m) => sum + m.items.length, 0);
    const perform = () => {
      const snapshot = topics;
      setTopics((prev) => prev.filter((t) => t.topicID !== topicID));
      withRollback(snapshot, () => deleteTopic(topicID));
    };
    if (moduleCount === 0) {
      perform();
      return;
    }
    setConfirm({
      title: `Delete "${topic.title}"?`,
      description: `The topic and its ${moduleCount} module${
        moduleCount === 1 ? "" : "s"
      }${
        itemCount > 0 ? ` (${itemCount} item${itemCount === 1 ? "" : "s"})` : ""
      } will be removed from this course. Uploaded files stay in your library.`,
      confirmLabel: "Delete topic",
      action: perform,
    });
  }

  /* ----------------------------- module CRUD ----------------------------- */

  async function handleAddModule(topicID: number) {
    setCreatingModuleTopicID(topicID);
    const topic = topics.find((t) => t.topicID === topicID);
    const title = `Module ${(topic?.modules.length ?? 0) + 1}`;
    try {
      const res = await createModule(topicID, title);
      if (res.ok && res.data) {
        setTopics((prev) =>
          prev.map((t) =>
            t.topicID === topicID
              ? {
                  ...t,
                  modules: [
                    ...t.modules,
                    { moduleID: res.data!.moduleID, topicID, title, items: [] },
                  ],
                }
              : t
          )
        );
      } else if (!res.ok) {
        setError(res.error);
      }
    } catch {
      setError("Couldn't create the module.");
    } finally {
      setCreatingModuleTopicID(null);
    }
  }

  function handleRenameModule(moduleID: number, title: string) {
    const snapshot = topics;
    setTopics((prev) =>
      prev.map((t) => ({
        ...t,
        modules: t.modules.map((m) =>
          m.moduleID === moduleID ? { ...m, title } : m
        ),
      }))
    );
    withRollback(snapshot, () => renameModule(moduleID, title));
  }

  function handleDeleteModule(moduleID: number) {
    let mod: ModuleDTO | undefined;
    for (const t of topics) {
      mod = t.modules.find((m) => m.moduleID === moduleID);
      if (mod) break;
    }
    if (!mod) return;
    const perform = () => {
      const snapshot = topics;
      setTopics((prev) =>
        prev.map((t) => ({
          ...t,
          modules: t.modules.filter((m) => m.moduleID !== moduleID),
        }))
      );
      withRollback(snapshot, () => deleteModule(moduleID));
    };
    if (mod.items.length === 0) {
      perform();
      return;
    }
    setConfirm({
      title: `Delete "${mod.title}"?`,
      description: `The module and its ${mod.items.length} item${
        mod.items.length === 1 ? "" : "s"
      } will be removed from this course. Uploaded files stay in your library.`,
      confirmLabel: "Delete module",
      action: perform,
    });
  }

  /* ------------------------------ item ops ------------------------------- */

  function attach(moduleID: number, resource: ResourceDTO) {
    const tempID = -(++tempCounter.current);
    setTopics((prev) =>
      prev.map((t) => ({
        ...t,
        modules: t.modules.map((m) =>
          m.moduleID === moduleID
            ? {
                ...m,
                items: [
                  ...m.items,
                  { itemID: tempID, title: null, resource, exam: null },
                ],
              }
            : m
        ),
      }))
    );
    attachResource(moduleID, resource.resourceID)
      .then((res) => {
        if (res.ok && res.data) {
          const realID = res.data.itemID;
          setTopics((prev) =>
            prev.map((t) => ({
              ...t,
              modules: t.modules.map((m) => ({
                ...m,
                items: m.items.map((i) =>
                  i.itemID === tempID ? { ...i, itemID: realID } : i
                ),
              })),
            }))
          );
          setSelectedItemID((cur) => (cur === tempID ? realID : cur));
        } else {
          setTopics((prev) =>
            prev.map((t) => ({
              ...t,
              modules: t.modules.map((m) => ({
                ...m,
                items: m.items.filter((i) => i.itemID !== tempID),
              })),
            }))
          );
          if (!res.ok) setError(res.error);
        }
      })
      .catch(() => {
        setTopics((prev) =>
          prev.map((t) => ({
            ...t,
            modules: t.modules.map((m) => ({
              ...m,
              items: m.items.filter((i) => i.itemID !== tempID),
            })),
          }))
        );
        setError("Couldn't add the resource to the module.");
      });
    setSelectedItemID(tempID);
  }

  function handleAttachToLastModule(resource: ResourceDTO) {
    const allModules = topics.flatMap((t) => t.modules);
    const last = allModules[allModules.length - 1];
    if (!last) return;
    attach(last.moduleID, resource);
  }

  function handleDetachItem(itemID: number) {
    if (itemID < 0) return; // still attaching
    const snapshot = topics;
    setTopics((prev) =>
      prev.map((t) => ({
        ...t,
        modules: t.modules.map((m) => ({
          ...m,
          items: m.items.filter((i) => i.itemID !== itemID),
        })),
      }))
    );
    if (selectedItemID === itemID) setSelectedItemID(null);
    withRollback(snapshot, () => detachItem(itemID));
  }

  function handleRenameItem(itemID: number, title: string) {
    if (itemID < 0) return;
    const snapshot = topics;
    setTopics((prev) =>
      prev.map((t) => ({
        ...t,
        modules: t.modules.map((m) => ({
          ...m,
          items: m.items.map((i) =>
            i.itemID === itemID ? { ...i, title: title.trim() || null } : i
          ),
        })),
      }))
    );
    withRollback(snapshot, () => renameItem(itemID, title));
  }

  function handleDeleteResource(resource: ResourceDTO) {
    const placements = topics.reduce(
      (acc, t) =>
        acc +
        t.modules.reduce(
          (a, m) =>
            a +
            m.items.filter((i) => i.resource?.resourceID === resource.resourceID)
              .length,
          0
        ),
      0
    );
    setConfirm({
      title: `Delete "${resource.title}"?`,
      description:
        placements > 0
          ? `The file is removed from your library and from ${placements} place${
              placements === 1 ? "" : "s"
            } in this course. It is also deleted from storage — this can't be undone.`
          : "The file is removed from your library and deleted from storage — this can't be undone.",
      confirmLabel: "Delete file",
      action: () => performDeleteResource(resource),
    });
  }

  function performDeleteResource(resource: ResourceDTO) {
    // The row stays visible with a "Deleting…" bar until Cloudinary and the
    // database both confirm — no optimistic removal.
    setDeletingResourceIDs((prev) => new Set(prev).add(resource.resourceID));
    const finish = () =>
      setDeletingResourceIDs((prev) => {
        const next = new Set(prev);
        next.delete(resource.resourceID);
        return next;
      });
    deleteResource(resource.resourceID)
      .then((res) => {
        if (res.ok) {
          setLibrary((prev) =>
            prev.filter((r) => r.resourceID !== resource.resourceID)
          );
          setTopics((prev) =>
            prev.map((t) => ({
              ...t,
              modules: t.modules.map((m) => ({
                ...m,
                items: m.items.filter(
                  (i) => i.resource?.resourceID !== resource.resourceID
                ),
              })),
            }))
          );
        } else {
          setError(res.error);
        }
        finish();
      })
      .catch(() => {
        setError("Couldn't delete the resource.");
        finish();
      });
  }

  /* -------------------------------- exams -------------------------------- */

  async function handleAddExam(moduleID: number) {
    if (creatingExamModuleID !== null) return;
    setCreatingExamModuleID(moduleID);
    try {
      const res = await createExam(moduleID, "Module exam");
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const { itemID, examID } = res.data!;
      setTopics((prev) =>
        prev.map((t) => ({
          ...t,
          modules: t.modules.map((m) =>
            m.moduleID === moduleID
              ? {
                  ...m,
                  items: [
                    ...m.items,
                    {
                      itemID,
                      title: "Module exam",
                      resource: null,
                      exam: { examID, questions: [] },
                    },
                  ],
                }
              : m
          ),
        }))
      );
      setSelectedItemID(itemID);
    } catch {
      setError("Couldn't create the exam.");
    } finally {
      setCreatingExamModuleID(null);
    }
  }

  /* ------------------------------ capstone ------------------------------- */

  async function handleSaveCapstone(
    input: CapstoneInput
  ): Promise<string | null> {
    try {
      const res = await saveCapstone(course.courseID, input);
      if (!res.ok) return res.error;
      setCapstone({
        capstoneID: res.data!.capstoneID,
        title: input.title.trim(),
        brief: input.brief.trim(),
        deliverables: input.deliverables.map((d) => d.trim()).filter(Boolean),
        criteria: input.criteria.map((c) => c.trim()).filter(Boolean),
        submissionCount: capstone?.submissionCount ?? 0,
        resources: capstone?.resources ?? [],
      });
      return null;
    } catch {
      return "Couldn't save the capstone.";
    }
  }

  function handleCapstoneResourceUploaded(resource: CapstoneResourceDTO) {
    setCapstone((prev) =>
      prev ? { ...prev, resources: [...prev.resources, resource] } : prev
    );
  }

  function handleDeleteCapstoneResource(resource: CapstoneResourceDTO) {
    setDeletingCapstoneResourceIDs((prev) => new Set(prev).add(resource.resourceID));
    const finish = () =>
      setDeletingCapstoneResourceIDs((prev) => {
        const next = new Set(prev);
        next.delete(resource.resourceID);
        return next;
      });
    deleteCapstoneResource(resource.resourceID)
      .then((res) => {
        if (res.ok) {
          setCapstone((prev) =>
            prev
              ? {
                  ...prev,
                  resources: prev.resources.filter(
                    (r) => r.resourceID !== resource.resourceID
                  ),
                }
              : prev
          );
        } else {
          setError(res.error);
        }
        finish();
      })
      .catch(() => {
        setError("Couldn't delete the file.");
        finish();
      });
  }

  function handleDeleteCapstone() {
    if (!capstone) return;
    setConfirm({
      title: `Delete "${capstone.title}"?`,
      description: `The capstone project${
        capstone.submissionCount > 0
          ? ` and its ${capstone.submissionCount} student submission${
              capstone.submissionCount === 1 ? "" : "s"
            } (including uploaded files)`
          : ""
      } will be permanently deleted — this can't be undone.`,
      confirmLabel: "Delete capstone",
      action: () => {
        const snapshot = capstone;
        setCapstone(null);
        deleteCapstone(course.courseID)
          .then((res) => {
            if (!res.ok) {
              setCapstone(snapshot);
              setError(res.error);
            }
          })
          .catch(() => {
            setCapstone(snapshot);
            setError("Couldn't delete the capstone.");
          });
      },
    });
  }

  function patchExam(
    examID: number,
    update: (questions: QuestionDTO[]) => QuestionDTO[]
  ) {
    setTopics((prev) =>
      prev.map((t) => ({
        ...t,
        modules: t.modules.map((m) => ({
          ...m,
          items: m.items.map((i) =>
            i.exam?.examID === examID
              ? { ...i, exam: { ...i.exam, questions: update(i.exam.questions) } }
              : i
          ),
        })),
      }))
    );
  }

  async function handleCreateQuestion(
    examID: number,
    input: McqInput
  ): Promise<string | null> {
    try {
      const res = await createExamQuestion(examID, input);
      if (!res.ok) return res.error;
      const questionID = res.data!.questionID;
      patchExam(examID, (qs) => [...qs, { questionID, ...input }]);
      return null;
    } catch {
      return "Couldn't save the question.";
    }
  }

  async function handleUpdateQuestion(
    examID: number,
    questionID: number,
    input: McqInput
  ): Promise<string | null> {
    try {
      const res = await updateExamQuestion(questionID, input);
      if (!res.ok) return res.error;
      patchExam(examID, (qs) =>
        qs.map((q) => (q.questionID === questionID ? { questionID, ...input } : q))
      );
      return null;
    } catch {
      return "Couldn't save the question.";
    }
  }

  async function handleDeleteQuestion(examID: number, questionID: number) {
    const snapshot = topics;
    patchExam(examID, (qs) => qs.filter((q) => q.questionID !== questionID));
    try {
      const res = await deleteExamQuestion(questionID);
      if (!res.ok) {
        setTopics(snapshot);
        setError(res.error);
      }
    } catch {
      setTopics(snapshot);
      setError("Couldn't delete the question.");
    }
  }

  /* ------------------------- video knowledge checks ---------------------- */

  function sortChecks(list: CheckDTO[]) {
    return [...list].sort((a, b) => a.timeSec - b.timeSec);
  }

  async function handleCreateCheck(
    resourceID: number,
    input: VideoCheckInput
  ): Promise<string | null> {
    try {
      const res = await createVideoCheck(resourceID, input);
      if (!res.ok) return res.error;
      const checkID = res.data!.checkID;
      setChecksByResource((prev) => ({
        ...prev,
        [resourceID]: sortChecks([...(prev[resourceID] ?? []), { checkID, ...input }]),
      }));
      return null;
    } catch {
      return "Couldn't save the check.";
    }
  }

  async function handleUpdateCheck(
    resourceID: number,
    checkID: number,
    input: VideoCheckInput
  ): Promise<string | null> {
    try {
      const res = await updateVideoCheck(checkID, input);
      if (!res.ok) return res.error;
      setChecksByResource((prev) => ({
        ...prev,
        [resourceID]: sortChecks(
          (prev[resourceID] ?? []).map((c) =>
            c.checkID === checkID ? { checkID, ...input } : c
          )
        ),
      }));
      return null;
    } catch {
      return "Couldn't save the check.";
    }
  }

  async function handleDeleteCheck(resourceID: number, checkID: number) {
    const snapshot = checksByResource;
    setChecksByResource((prev) => ({
      ...prev,
      [resourceID]: (prev[resourceID] ?? []).filter((c) => c.checkID !== checkID),
    }));
    try {
      const res = await deleteVideoCheck(checkID);
      if (!res.ok) {
        setChecksByResource(snapshot);
        setError(res.error);
      }
    } catch {
      setChecksByResource(snapshot);
      setError("Couldn't delete the check.");
    }
  }

  /* ----------------------------- drag & drop ----------------------------- */

  function locateModule(overId: string): { topicIdx: number; moduleIdx: number } | null {
    if (overId.startsWith(MODDROP)) {
      const id = Number(overId.slice(MODDROP.length));
      for (let ti = 0; ti < topics.length; ti++) {
        const mi = topics[ti].modules.findIndex((m) => m.moduleID === id);
        if (mi >= 0) return { topicIdx: ti, moduleIdx: mi };
      }
      return null;
    }
    if (overId.startsWith(MOD)) {
      const id = Number(overId.slice(MOD.length));
      for (let ti = 0; ti < topics.length; ti++) {
        const mi = topics[ti].modules.findIndex((m) => m.moduleID === id);
        if (mi >= 0) return { topicIdx: ti, moduleIdx: mi };
      }
      return null;
    }
    if (overId.startsWith(ITEM)) {
      const id = Number(overId.slice(ITEM.length));
      for (let ti = 0; ti < topics.length; ti++) {
        const mi = topics[ti].modules.findIndex((m) => m.items.some((i) => i.itemID === id));
        if (mi >= 0) return { topicIdx: ti, moduleIdx: mi };
      }
      return null;
    }
    return null;
  }

  function topicIndexForDropId(overId: string): number {
    if (overId.startsWith(TOPICDROP)) {
      const id = Number(overId.slice(TOPICDROP.length));
      return topics.findIndex((t) => t.topicID === id);
    }
    if (overId.startsWith(TOPIC)) {
      const id = Number(overId.slice(TOPIC.length));
      return topics.findIndex((t) => t.topicID === id);
    }
    const loc = locateModule(overId);
    return loc ? loc.topicIdx : -1;
  }

  function moduleDropTarget(overId: string): { topicIdx: number; moduleIdx: number } | null {
    if (overId.startsWith(TOPICDROP)) {
      const id = Number(overId.slice(TOPICDROP.length));
      const topicIdx = topics.findIndex((t) => t.topicID === id);
      if (topicIdx < 0) return null;
      return { topicIdx, moduleIdx: topics[topicIdx].modules.length };
    }
    if (overId.startsWith(TOPIC)) {
      const id = Number(overId.slice(TOPIC.length));
      const topicIdx = topics.findIndex((t) => t.topicID === id);
      if (topicIdx < 0) return null;
      return { topicIdx, moduleIdx: topics[topicIdx].modules.length };
    }
    return locateModule(overId);
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const a = String(active.id);
    const o = String(over.id);
    if (a === o) return;

    // Case 0: topic reorder
    if (a.startsWith(TOPIC)) {
      const fromIdx = topics.findIndex((t) => `${TOPIC}${t.topicID}` === a);
      const toIdx = topicIndexForDropId(o);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
      const snapshot = topics;
      const next = arrayMove(topics, fromIdx, toIdx);
      setTopics(next);
      withRollback(snapshot, () =>
        reorderTopics(course.courseID, next.map((t) => t.topicID))
      );
      return;
    }

    // Case 1: library resource dropped on a module / item
    if (a.startsWith(LIB)) {
      const resourceID = Number(a.slice(LIB.length));
      const resource = library.find((r) => r.resourceID === resourceID);
      const loc = locateModule(o);
      if (!resource || !loc) return;
      attach(topics[loc.topicIdx].modules[loc.moduleIdx].moduleID, resource);
      return;
    }

    // Case 2: module reorder / cross-topic move
    if (a.startsWith(MOD)) {
      const fromLoc = locateModule(a);
      const toLoc = moduleDropTarget(o);
      if (!fromLoc || !toLoc) return;

      const snapshot = topics;

      if (fromLoc.topicIdx === toLoc.topicIdx) {
        const topic = topics[fromLoc.topicIdx];
        const toModuleIdx = Math.min(toLoc.moduleIdx, topic.modules.length - 1);
        if (toModuleIdx === fromLoc.moduleIdx) return;
        const next = topics.map((t, idx) =>
          idx === fromLoc.topicIdx
            ? { ...t, modules: arrayMove(t.modules, fromLoc.moduleIdx, toModuleIdx) }
            : t
        );
        setTopics(next);
        withRollback(snapshot, () =>
          moveModules(course.courseID, [
            {
              topicID: next[fromLoc.topicIdx].topicID,
              orderedModuleIDs: next[fromLoc.topicIdx].modules.map((m) => m.moduleID),
            },
          ])
        );
      } else {
        const next = [...topics];
        const fromTopic = { ...next[fromLoc.topicIdx] };
        const moving = fromTopic.modules[fromLoc.moduleIdx];
        fromTopic.modules = fromTopic.modules.filter(
          (m) => m.moduleID !== moving.moduleID
        );
        next[fromLoc.topicIdx] = fromTopic;
        const toTopic = { ...next[toLoc.topicIdx] };
        const insertAt = Math.min(toLoc.moduleIdx, toTopic.modules.length);
        const movedModules = [...toTopic.modules];
        movedModules.splice(insertAt, 0, { ...moving, topicID: toTopic.topicID });
        toTopic.modules = movedModules;
        next[toLoc.topicIdx] = toTopic;
        setTopics(next);
        withRollback(snapshot, () =>
          moveModules(course.courseID, [
            {
              topicID: next[fromLoc.topicIdx].topicID,
              orderedModuleIDs: next[fromLoc.topicIdx].modules.map((m) => m.moduleID),
            },
            {
              topicID: next[toLoc.topicIdx].topicID,
              orderedModuleIDs: next[toLoc.topicIdx].modules.map((m) => m.moduleID),
            },
          ])
        );
      }
      return;
    }

    // Case 3: item reorder / cross-module move (possibly cross-topic)
    if (a.startsWith(ITEM)) {
      const itemID = Number(a.slice(ITEM.length));
      if (itemID < 0) return; // temp item, still attaching
      const fromLoc = locateModule(a);
      const toLoc = locateModule(o);
      if (!fromLoc || !toLoc) return;

      const fromMod = topics[fromLoc.topicIdx].modules[fromLoc.moduleIdx];
      const toMod = topics[toLoc.topicIdx].modules[toLoc.moduleIdx];
      if (
        fromMod.items.some((it) => it.itemID < 0) ||
        toMod.items.some((it) => it.itemID < 0)
      ) {
        setError("Hold on — a resource is still being added.");
        return;
      }

      const snapshot = topics;

      if (fromMod.moduleID === toMod.moduleID) {
        const fromItemIdx = fromMod.items.findIndex((i) => i.itemID === itemID);
        const overItemIdx = o.startsWith(ITEM)
          ? fromMod.items.findIndex((i) => i.itemID === Number(o.slice(ITEM.length)))
          : fromMod.items.length - 1;
        if (overItemIdx < 0 || overItemIdx === fromItemIdx) return;
        const next = topics.map((t, ti) =>
          ti === fromLoc.topicIdx
            ? {
                ...t,
                modules: t.modules.map((m, mi) =>
                  mi === fromLoc.moduleIdx
                    ? { ...m, items: arrayMove(m.items, fromItemIdx, overItemIdx) }
                    : m
                ),
              }
            : t
        );
        setTopics(next);
        const movedModule = next[fromLoc.topicIdx].modules[fromLoc.moduleIdx];
        withRollback(snapshot, () =>
          moveItems(course.courseID, [
            {
              moduleID: movedModule.moduleID,
              orderedItemIDs: movedModule.items.map((i) => i.itemID),
            },
          ])
        );
      } else {
        const next = topics.map((t) => ({
          ...t,
          modules: t.modules.map((m) => ({ ...m })),
        }));
        const fromModNext = next[fromLoc.topicIdx].modules[fromLoc.moduleIdx];
        const toModNext = next[toLoc.topicIdx].modules[toLoc.moduleIdx];
        const moving = fromModNext.items.find((i) => i.itemID === itemID)!;
        fromModNext.items = fromModNext.items.filter((i) => i.itemID !== itemID);
        toModNext.items = [...toModNext.items, moving];
        setTopics(next);
        withRollback(snapshot, () =>
          moveItems(course.courseID, [
            {
              moduleID: fromModNext.moduleID,
              orderedItemIDs: fromModNext.items.map((i) => i.itemID),
            },
            {
              moduleID: toModNext.moduleID,
              orderedItemIDs: toModNext.items.map((i) => i.itemID),
            },
          ])
        );
      }
    }
  }

  /* ------------------------------ drag overlay --------------------------- */

  const overlay = (() => {
    if (!activeId) return null;
    if (activeId.startsWith(LIB)) {
      const r = library.find((x) => x.resourceID === Number(activeId.slice(LIB.length)));
      return r ? <LibraryRowPreview resource={r} /> : null;
    }
    if (activeId.startsWith(TOPIC)) {
      const t = topics.find((x) => `${TOPIC}${x.topicID}` === activeId);
      return t ? <TopicPreview title={t.title} moduleCount={t.modules.length} /> : null;
    }
    if (activeId.startsWith(MOD)) {
      for (const t of topics) {
        const m = t.modules.find((x) => `${MOD}${x.moduleID}` === activeId);
        if (m) return <ModulePreview title={m.title} itemCount={m.items.length} />;
      }
      return null;
    }
    if (activeId.startsWith(ITEM)) {
      for (const t of topics) {
        for (const m of t.modules) {
          const i = m.items.find((x) => `${ITEM}${x.itemID}` === activeId);
          if (i) return <ItemRowPreview item={i} />;
        }
      }
    }
    return null;
  })();

  const hasAnyModule = topics.some((t) => t.modules.length > 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {/* TOP BAR — deep forest brand band */}
      <div className="sticky top-0 z-30 bg-[var(--color-forest-900)] text-white shadow-[0_2px_12px_rgba(6,29,21,0.25)]">
        <div className="mx-auto max-w-7xl px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/instructor/${course.courseID}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Back to course"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[12px] text-white/50">Builder</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              <span className="truncate text-[15px] font-semibold">
                {course.title}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  course.status === "DRAFT"
                    ? "bg-[#c2871e]/25 text-[#f0c469] ring-1 ring-[#c2871e]/40"
                    : "bg-[#16a34a]/25 text-[#7be3a4] ring-1 ring-[#16a34a]/40"
                )}
              >
                {course.status.toLowerCase()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddTopic}
            disabled={creatingTopic}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-[var(--color-forest-900)] hover:bg-[var(--color-cream-100)] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {creatingTopic ? "Adding…" : "Add topic"}
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error ? (
        <div className="mx-auto max-w-7xl px-10 pt-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-[13px] font-medium text-amber-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className="text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* THREE COLUMNS */}
      <div className="mx-auto max-w-7xl px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)_360px] gap-8 items-start">
          {/* LEFT — RESOURCE LIBRARY */}
          <ResourceLibrary
            courseID={course.courseID}
            library={library}
            onUploaded={(r) => setLibrary((prev) => [r, ...prev])}
            onAttach={hasAnyModule ? handleAttachToLastModule : undefined}
            onDelete={handleDeleteResource}
            deletingIDs={deletingResourceIDs}
          />

          {/* MIDDLE — TOPICS */}
          <main className="min-w-0">
            {topics.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[var(--color-ink-300)] bg-white/60 p-12 text-center">
                <div className="text-[16px] font-semibold text-[var(--color-ink-900)]">
                  No topics yet
                </div>
                <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-ink-500)]">
                  Topics group your modules — and their videos, lectures, and
                  files — in the order learners will follow.
                </p>
                <button
                  type="button"
                  onClick={handleAddTopic}
                  disabled={creatingTopic}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-mint-500)] px-4 py-2 text-[13px] font-semibold text-[var(--color-forest-950)] hover:bg-[var(--color-mint-400)] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add your first topic
                </button>
              </div>
            ) : (
              <SortableContext
                items={topics.map((t) => `${TOPIC}${t.topicID}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-5">
                  {topics.map((t) => (
                    <SortableTopicCard
                      key={t.topicID}
                      topic={t}
                      collapsed={!!collapsedTopics[t.topicID]}
                      onToggle={() =>
                        setCollapsedTopics((p) => ({ ...p, [t.topicID]: !p[t.topicID] }))
                      }
                      onRename={(title) => handleRenameTopic(t.topicID, title)}
                      onDelete={() => handleDeleteTopic(t.topicID)}
                      onAddModule={() => void handleAddModule(t.topicID)}
                      addingModule={creatingModuleTopicID === t.topicID}
                      collapsedModules={collapsedModules}
                      onToggleModule={(moduleID) =>
                        setCollapsedModules((p) => ({ ...p, [moduleID]: !p[moduleID] }))
                      }
                      selectedItemID={selectedItemID}
                      onSelectItem={setSelectedItemID}
                      onRenameModule={handleRenameModule}
                      onDeleteModule={handleDeleteModule}
                      onAddExam={(moduleID) => void handleAddExam(moduleID)}
                      addingExamModuleID={creatingExamModuleID}
                    />
                  ))}
                </div>
              </SortableContext>
            )}

            {/* CAPSTONE — end of course */}
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--color-ink-200)]/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-ink-400)]">
                  End of course
                </span>
                <span className="h-px flex-1 bg-[var(--color-ink-200)]/70" />
              </div>
              <CapstoneCard
                capstone={capstone}
                onSave={handleSaveCapstone}
                onDelete={handleDeleteCapstone}
                onResourceUploaded={handleCapstoneResourceUploaded}
                onResourceDelete={handleDeleteCapstoneResource}
                deletingResourceIDs={deletingCapstoneResourceIDs}
              />
            </div>

            {/* COURSE PAGE — overview markdown */}
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--color-ink-200)]/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-ink-400)]">
                  Course page
                </span>
                <span className="h-px flex-1 bg-[var(--color-ink-200)]/70" />
              </div>
              <OverviewCard
                courseID={course.courseID}
                initialOverview={initialOverview}
              />
            </div>
          </main>

          {/* RIGHT — INSPECTOR */}
          <InspectorPanel
            selected={selected}
            onRename={handleRenameItem}
            onDetach={handleDetachItem}
            checks={
              selected?.item.resource
                ? checksByResource[selected.item.resource.resourceID] ?? []
                : []
            }
            onCreateCheck={handleCreateCheck}
            onUpdateCheck={handleUpdateCheck}
            onDeleteCheck={handleDeleteCheck}
            onCreateQuestion={handleCreateQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </div>
      </div>

      <DragOverlay>{overlay}</DragOverlay>

      <ConfirmDeleteDialog
        confirm={confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
      />
    </DndContext>
  );
}
