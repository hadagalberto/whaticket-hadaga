import { useState, useEffect } from "react";
import api from "../services/api";
import toastError from "../errors/toastError";

const useKanbanBoards = () => {
  const [kanbanBoards, setKanbanBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKanbanBoards = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/kanban");
        setKanbanBoards(data);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchKanbanBoards();
  }, []);

  const getKanbanColumns = (boardId) => {
    const board = kanbanBoards.find((b) => b.id === boardId);
    return board ? board.columns : [];
  };

  return { kanbanBoards, loading, getKanbanColumns };
};

export default useKanbanBoards;
