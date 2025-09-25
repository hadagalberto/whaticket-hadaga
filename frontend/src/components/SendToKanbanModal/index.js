import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const SendToKanbanModal = ({ modalOpen, onClose, ticketId }) => {
  const [loading, setLoading] = useState(false);
  const [kanbanBoards, setKanbanBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      fetchKanbanBoards();
    }
  }, [modalOpen]);

  const fetchKanbanBoards = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/kanban");
      setKanbanBoards(data);
      if (data.length > 0) {
        setSelectedBoard(data[0].id);
        if (data[0].columns && data[0].columns.length > 0) {
          setSelectedColumn(data[0].columns[0].id);
        }
      }
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardChange = (event) => {
    const boardId = event.target.value;
    setSelectedBoard(boardId);

    const board = kanbanBoards.find((b) => b.id === boardId);
    if (board && board.columns && board.columns.length > 0) {
      setSelectedColumn(board.columns[0].id);
    } else {
      setSelectedColumn("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedColumn) {
      toast.error("Selecione uma coluna");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/kanban/add-ticket", {
        ticketId,
        kanbanColumnId: selectedColumn,
      });

      toast.success("Ticket enviado para o Kanban com sucesso!");
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedBoard("");
    setSelectedColumn("");
    onClose();
  };

  const selectedBoardData = kanbanBoards.find((b) => b.id === selectedBoard);

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enviar Ticket para Kanban</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Quadro Kanban</InputLabel>
              <Select value={selectedBoard} onChange={handleBoardChange}>
                {kanbanBoards.map((board) => (
                  <MenuItem key={board.id} value={board.id}>
                    {board.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedBoardData && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Coluna</InputLabel>
                <Select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  {selectedBoardData.columns?.map((column) => (
                    <MenuItem key={column.id} value={column.id}>
                      <Box display="flex" alignItems="center">
                        <Box
                          width={12}
                          height={12}
                          borderRadius="50%"
                          bgcolor={column.color}
                          mr={1}
                        />
                        {column.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {kanbanBoards.length === 0 && !loading && (
              <Typography color="textSecondary" align="center">
                Nenhum quadro Kanban encontrado. Crie um quadro primeiro.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!selectedColumn || submitting || loading}
        >
          {submitting ? <CircularProgress size={20} /> : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendToKanbanModal;
