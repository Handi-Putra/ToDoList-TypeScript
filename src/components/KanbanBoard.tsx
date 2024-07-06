import { useMemo, useState } from "react";
import Plusicon from "../icons/Plusicon"
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import { 
        DndContext, 
        DragEndEvent,
        DragOverEvent,
        DragOverlay, 
        DragStartEvent,
        PointerSensor,
        useSensor,
        useSensors,
    } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const defaultCols: Column[] = [
    {
        id: "todo",
        title: "To Do",
    },
    {
        id: "ongoing",
        title: "On Going",
    },
    {
        id: "done",
        title: "Done",
    },
];

const defaultTasks: Task[] = [
    {
        id: "1",
        columnId: "todo",
        content: "Create Post API for Kanwil Branch",
    },
    {
        id: "2",
        columnId: "todo",
        content: "Built FrontEnd for Kanwil Branch Form",
    },
    {
        id: "3",
        columnId: "ongoing",
        content: "Code review for Security",
    },
    {
        id: "4",
        columnId: "ongoing",
        content: "Testing Get API Kanwil Branch",
    },
    {
        id: "5",
        columnId: "done",
        content: "Create FrontEnd for Branch Activity",
    },
    {
        id: "6",
        columnId: "done",
        content: "Dev & PM Meeting",
    },
    {
        id: "7",
        columnId: "done",
        content: "Deliver Dashborad Prototype",
    },
    {
        id: "8",
        columnId: "todo",
        content: "SSL BOS",
    },
    {
        id: "9",
        columnId: "todo",
        content: "Implement Data Validation",
    },
    {
        id: "10",
        columnId: "todo",
        content: "Design Database Schema for Kanwil Branch",
    },
];

function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>(defaultCols);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useState<Task[]>(defaultTasks);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);

    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

  return (
    <div className="bg-custom-bg bg-cover bg-center bg-no-repeat text-white">
        
        <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold mt-20">Kanban Board</h1>
        </div>

        <div className="m-auto flex min-h-screen overflow-x-auto
                    w-full items-center 
                    overflow-y-hidden px-[40px]">
            <DndContext 
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                >
                <div className="m-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                        {columns.map((col) => (
                            <div>
                                <ColumnContainer 
                                    key={col.id} 
                                    column={col} 
                                    deleteColumn={deleteColumn} 
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    tasks={tasks.filter((task) => task.columnId === col.id)}    
                                />
                            </div>
                        ))}
                            </SortableContext>
                    </div>

                    <button 
                        onClick={() => {
                            createNewColumn();
                        }}
                        className="h-[60px] w-[350px] min-w-[350px] 
                                cursor-pointer rounded-lg bg-mainBackgroundColor
                                border-2 border-columnBackgroundColor
                                p-4 ring-rose-500 hover:ring-2
                                flex gap-2">
                        <Plusicon /> Add Column
                    </button>
                </div>

                { createPortal( 
                <DragOverlay>
                    {activeColumn && (
                        <ColumnContainer
                            column={activeColumn}
                            deleteColumn={deleteColumn}
                            updateColumn={updateColumn}
                            createTask={createTask}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            tasks={tasks.filter(
                                (task) => task.columnId === activeColumn.id
                            )}    
                        />
                    )}
                    {activeTask && (
                        <TaskCard 
                            task={activeTask}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    )}
                </DragOverlay>, 
                document.body
            )}
            </DndContext>
        </div>
        
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    console.log("DRAG END");

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          // Fix introduced after video recording
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard