import React, { useState, useEffect, useReducer } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import AiAgentModal from "../../components/AiAgentModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_AI_AGENTS") {
    const aiAgents = action.payload;
    const newAiAgents = [];

    aiAgents.forEach((aiAgent) => {
      const aiAgentIndex = state.findIndex((u) => u.id === aiAgent.id);
      if (aiAgentIndex !== -1) {
        state[aiAgentIndex] = aiAgent;
      } else {
        newAiAgents.push(aiAgent);
      }
    });

    return [...state, ...newAiAgents];
  }

  if (action.type === "UPDATE_AI_AGENTS") {
    const aiAgent = action.payload;
    const aiAgentIndex = state.findIndex((u) => u.id === aiAgent.id);

    if (aiAgentIndex !== -1) {
      state[aiAgentIndex] = aiAgent;
      return [...state];
    } else {
      return [aiAgent, ...state];
    }
  }

  if (action.type === "DELETE_AI_AGENT") {
    const aiAgentId = action.payload;

    const aiAgentIndex = state.findIndex((u) => u.id === aiAgentId);
    if (aiAgentIndex !== -1) {
      state.splice(aiAgentIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const AiAgents = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [aiAgents, dispatch] = useReducer(reducer, []);
  const [selectedAiAgent, setSelectedAiAgent] = useState(null);
  const [aiAgentModalOpen, setAiAgentModalOpen] = useState(false);
  const [deletingAiAgent, setDeletingAiAgent] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchAiAgents = async () => {
        try {
          const { data } = await api.get("/ai-agents", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_AI_AGENTS", payload: data });
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchAiAgents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("aiAgent", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_AI_AGENTS", payload: data.aiAgent });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_AI_AGENT", payload: +data.aiAgentId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenAiAgentModal = () => {
    setSelectedAiAgent(null);
    setAiAgentModalOpen(true);
  };

  const handleCloseAiAgentModal = () => {
    setSelectedAiAgent(null);
    setAiAgentModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditAiAgent = (aiAgent) => {
    setSelectedAiAgent(aiAgent);
    setAiAgentModalOpen(true);
  };

  const handleDeleteAiAgent = async (aiAgentId) => {
    try {
      await api.delete(`/ai-agents/${aiAgentId}`);
      toast.success(i18n.t("aiAgents.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingAiAgent(null);
    setConfirmModalOpen(false);
  };

  const getProviderLabel = (provider) => {
    switch (provider) {
      case "openai":
        return "OpenAI";
      case "gemini":
        return "Google Gemini";
      default:
        return provider;
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingAiAgent &&
          `${i18n.t("aiAgents.confirmationModal.deleteTitle")} ${
            deletingAiAgent.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteAiAgent(deletingAiAgent.id)}
      >
        {i18n.t("aiAgents.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <AiAgentModal
        open={aiAgentModalOpen}
        onClose={handleCloseAiAgentModal}
        aiAgentId={selectedAiAgent && selectedAiAgent.id}
      />
      <MainHeader>
        <Title>{i18n.t("aiAgents.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("aiAgents.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAiAgentModal}
          >
            {i18n.t("aiAgents.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("aiAgents.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("aiAgents.table.provider")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("aiAgents.table.model")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("aiAgents.table.queue")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("aiAgents.table.status")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("aiAgents.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={6} />
            ) : (
              aiAgents.map((aiAgent) => (
                <TableRow key={aiAgent.id}>
                  <TableCell align="center">{aiAgent.name}</TableCell>
                  <TableCell align="center">
                    {getProviderLabel(aiAgent.provider)}
                  </TableCell>
                  <TableCell align="center">{aiAgent.model}</TableCell>
                  <TableCell align="center">{aiAgent.queue?.name}</TableCell>
                  <TableCell align="center">
                    {aiAgent.isActive
                      ? i18n.t("aiAgents.status.active")
                      : i18n.t("aiAgents.status.inactive")}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditAiAgent(aiAgent)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingAiAgent(aiAgent);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            {aiAgents.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {i18n.t("aiAgents.table.noData")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default AiAgents;
