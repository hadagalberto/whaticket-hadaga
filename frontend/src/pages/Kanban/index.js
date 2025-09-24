import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Avatar,
} from "@material-ui/core";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
} from "@material-ui/icons";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  kanbanBoard: {
    display: "flex",
    gap: theme.spacing(2),
    minHeight: "calc(100vh - 200px)",
    padding: theme.spacing(2),
  },
  kanbanColumn: {
    minWidth: 300,
    maxWidth: 300,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
  },
  ticketCard: {
    marginBottom: theme.spacing(1),
    cursor: "pointer",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  ticketContent: {
    padding: theme.spacing(1),
  },
  ticketMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  addTicketArea: {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    textAlign: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const KanbanBoard = () => {
  const classes = useStyles();
  const [kanbanData, setKanbanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const fetchKanbanData = async () => {
    try {
      const response = await api.get("/kanban");
      setKanbanData(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Erro ao carregar dados do Kanban");
      setLoading(false);
    }
  };

  const handleMoveTicket = async (ticketId, kanbanColumnId, position) => {
    try {
      await api.post("/kanban/move-ticket", {
        ticketId: parseInt(ticketId),
        kanbanColumnId: parseInt(kanbanColumnId),
        position: position || 0,
      });

      // Atualizar dados localmente
      fetchKanbanData();
      toast.success("Ticket movido com sucesso!");
    } catch (err) {
      toast.error("Erro ao mover ticket");
    }
  };

  const handleCreateBoard = async () => {
    try {
      await api.post("/kanban", {
        name: newBoardName,
        description: newBoardDescription,
      });

      toast.success("Quadro Kanban criado com sucesso!");
      setDialogOpen(false);
      setNewBoardName("");
      setNewBoardDescription("");
      fetchKanbanData();
    } catch (err) {
      toast.error("Erro ao criar quadro Kanban");
    }
  };

  if (loading) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>Kanban</Title>
        </MainHeader>
        <Typography>Carregando...</Typography>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Quadro Kanban</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Novo Quadro
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper}>
        {kanbanData.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Typography variant="h6" color="textSecondary">
              Nenhum quadro Kanban encontrado
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              style={{ marginTop: 16 }}
            >
              Criar Primeiro Quadro
            </Button>
          </Box>
        ) : (
          kanbanData.map((board) => (
            <Box key={board.id} mb={4}>
              <Typography variant="h5" gutterBottom>
                {board.name}
              </Typography>

              <Box className={classes.kanbanBoard}>
                {board.columns?.map((column) => (
                  <Paper key={column.id} className={classes.kanbanColumn}>
                    <Box
                      className={classes.columnHeader}
                      style={{ backgroundColor: column.color + "20" }}
                    >
                      <Box display="flex" alignItems="center">
                        <Box
                          width={12}
                          height={12}
                          borderRadius="50%"
                          bgcolor={column.color}
                          mr={1}
                        />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {column.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={column.tickets?.length || 0}
                          style={{ marginLeft: 8 }}
                        />
                      </Box>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box
                      minHeight={200}
                      style={{
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      {column.tickets?.map((ticket, index) => (
                        <Card key={ticket.id} className={classes.ticketCard}>
                          <CardContent className={classes.ticketContent}>
                            <Typography variant="body2" gutterBottom>
                              #{ticket.id} - {ticket.contact?.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              noWrap
                            >
                              {ticket.lastMessage}
                            </Typography>
                            <Box className={classes.ticketMeta}>
                              <Chip
                                size="small"
                                label={ticket.status}
                                color={
                                  ticket.status === "open"
                                    ? "primary"
                                    : "default"
                                }
                              />
                              {ticket.user && (
                                <Avatar style={{ width: 24, height: 24 }}>
                                  <PersonIcon style={{ fontSize: 16 }} />
                                </Avatar>
                              )}
                            </Box>
                          </CardContent>
                          <CardActions
                            style={{
                              padding: 8,
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="caption" color="textSecondary">
                              Mover para:
                            </Typography>
                            <Box>
                              {board.columns
                                ?.filter((col) => col.id !== column.id)
                                .map((targetColumn) => (
                                  <Button
                                    key={targetColumn.id}
                                    size="small"
                                    style={{
                                      minWidth: 32,
                                      marginLeft: 4,
                                      backgroundColor:
                                        targetColumn.color + "20",
                                      color: targetColumn.color,
                                    }}
                                    onClick={() =>
                                      handleMoveTicket(
                                        ticket.id,
                                        targetColumn.id,
                                        0
                                      )
                                    }
                                  >
                                    {targetColumn.name.substring(0, 3)}
                                  </Button>
                                ))}
                            </Box>
                          </CardActions>
                        </Card>
                      ))}

                      {column.tickets?.length === 0 && (
                        <Box className={classes.addTicketArea}>
                          <Typography variant="caption" color="textSecondary">
                            Nenhum ticket nesta coluna
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          ))
        )}
      </Paper>

      {/* Dialog para criar novo quadro */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Criar Novo Quadro Kanban</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Quadro"
            fullWidth
            variant="outlined"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newBoardDescription}
            onChange={(e) => setNewBoardDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateBoard}
            color="primary"
            variant="contained"
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default KanbanBoard;
