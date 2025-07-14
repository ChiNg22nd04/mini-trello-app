import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import API_BASE_URL from "../../../config/config";

import { Header, TopSideBar } from "../../components";
import Sidebar from "./Sidebar";
import TaskDetail from "./TaskDetail";

import { useUser } from "../../hooks";
const STATUSES = ["todo", "doing", "done"];

const STATUS_LABELS = {
    todo: "To Do",
    doing: "Doing",
    done: "Done",
};

const CardPage = () => {
    const { user, token } = useUser();
    const { id: boardId } = useParams();

    const [board, setBoard] = useState(null);

    const [tasksByStatus, setTasksByStatus] = useState({
        todo: [],
        doing: [],
        done: [],
    });

    const [selectedTask, setSelectedTask] = useState(null);

    const headerHeight = "60px";

    console.log(boardId);

    useEffect(() => {
        if (!user || !token || !boardId) return;

        const fetchData = async () => {
            try {
                const boardRes = await axios.get(`${API_BASE_URL}/boards/${boardId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBoard(boardRes.data);

                const cardsRes = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const allTasks = [];

                for (const card of cardsRes.data) {
                    const taskRes = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const tasks = taskRes.data.map((task) => ({
                        ...task,
                        cardId: card.id,
                        cardName: card.name,
                    }));

                    allTasks.push(...tasks);
                }

                const grouped = {
                    todo: [],
                    doing: [],
                    done: [],
                };

                allTasks.forEach((task) => {
                    const status = task.status || "todo";
                    grouped[status].push(task);
                });

                setTasksByStatus(grouped);
            } catch (err) {
                console.error("Failed to fetch board or tasks:", err);
            }
        };

        fetchData();
    }, [user, token, boardId]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;

        const movedTask = tasksByStatus[sourceStatus].find((t) => t.id === draggableId);
        if (!movedTask) return;

        try {
            await axios.put(
                `${API_BASE_URL}/tasks/${draggableId}`,
                {
                    status: destStatus,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setTasksByStatus((prev) => {
                return {
                    ...prev,
                    [sourceStatus]: prev[sourceStatus].filter((t) => t.id !== draggableId),
                    [destStatus]: [...prev[destStatus], { ...movedTask, status: destStatus }],
                };
            });
        } catch (err) {
            console.error("Failed to update task status:", err);
        }
    };

    const handleAddTask = (status) => {
        console.log("status", status);
    };

    return (
        <>
            <Header isShow={false} username={user?.username} style={{ height: headerHeight, zIndex: 1030 }} />
            <div
                className="d-flex bg-dark text-white"
                style={{
                    paddingTop: headerHeight,
                    minHeight: "100vh",
                }}
            >
                <div style={{ width: "20%", position: "fixed" }}>
                    <Sidebar active="boards" fullHeight title={board?.name} members={board?.members} />
                </div>

                <div
                    style={{
                        marginLeft: "20%",
                        width: "80%",
                        overflowY: "auto",
                        backgroundColor: "#f5f5f5",
                    }}
                >
                    <TopSideBar
                        boardName={board?.name}
                        className="text-white fw-normal p-2 mb-4 fs-5 ps-4 pe-4 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#743153" }}
                    />

                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="d-flex gap-3 p-3" style={{ overflowX: "auto" }}>
                            {STATUSES.map((status) => (
                                <Droppable droppableId={status} key={status}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="rounded p-3"
                                            style={{
                                                minWidth: "280px",
                                                backgroundColor: "#1e252a",
                                                flex: "1",
                                                height: "100%",
                                            }}
                                        >
                                            <p className="text-white mb-3">{STATUS_LABELS[status]}</p>

                                            {tasksByStatus[status].map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            onClick={() => setSelectedTask(task)}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-dark text-white border rounded mb-3 p-2"
                                                        >
                                                            <strong>{task.title}</strong>
                                                            <p className="mb-1">{task.description}</p>
                                                            <small className="text-muted">Card: {task.cardName}</small>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}

                                            {provided.placeholder}
                                            <button className="d-flex justify-content-between mt-2 btn btn-sm text-white text-start border-none mt-2 w-100" onClick={() => handleAddTask(status)}>
                                                <div className="d-flex justify-content-between">
                                                    <Icon width={20} icon="material-symbols:add" />
                                                    <span> Add Task</span>
                                                </div>
                                                <Icon width={20} icon="material-symbols:ink-selection-rounded" />
                                            </button>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>
            <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
        </>
    );
};

export default CardPage;
