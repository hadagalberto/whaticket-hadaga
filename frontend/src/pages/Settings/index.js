import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Box from "@material-ui/core/Box";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import useKanbanBoards from "../../hooks/useKanbanBoards";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(8, 8, 3),
  },

  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },

  settingOption: {
    marginLeft: "auto",
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

const Settings = () => {
  const classes = useStyles();

  const [settings, setSettings] = useState([]);
  const [kanbanAutoAdd, setKanbanAutoAdd] = useState("disabled");
  const [kanbanDefaultBoard, setKanbanDefaultBoard] = useState("");
  const [kanbanDefaultColumn, setKanbanDefaultColumn] = useState("");

  const {
    kanbanBoards,
    loading: kanbanLoading,
    getKanbanColumns,
  } = useKanbanBoards();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);

        // Load Kanban settings
        const kanbanAutoAddSetting = data.find(
          (s) => s.key === "kanbanAutoAdd"
        );
        const kanbanDefaultBoardSetting = data.find(
          (s) => s.key === "kanbanDefaultBoard"
        );
        const kanbanDefaultColumnSetting = data.find(
          (s) => s.key === "kanbanDefaultColumn"
        );

        if (kanbanAutoAddSetting) {
          setKanbanAutoAdd(kanbanAutoAddSetting.value);
        }
        if (kanbanDefaultBoardSetting) {
          setKanbanDefaultBoard(kanbanDefaultBoardSetting.value);
        }
        if (kanbanDefaultColumnSetting) {
          setKanbanDefaultColumn(kanbanDefaultColumnSetting.value);
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("settings", (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
          aux[settingIndex].value = data.setting.value;
          return aux;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChangeSetting = async (e) => {
    const selectedValue = e.target.value;
    const settingKey = e.target.name;

    try {
      await api.put(`/settings/${settingKey}`, {
        value: selectedValue,
      });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const getSettingValue = (key) => {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : "";
  };

  const handleKanbanAutoAddChange = async (e) => {
    const value = e.target.value;
    setKanbanAutoAdd(value);

    try {
      await api.put(`/settings/kanbanAutoAdd`, { value });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleKanbanDefaultBoardChange = async (e) => {
    const value = e.target.value;
    setKanbanDefaultBoard(value);
    setKanbanDefaultColumn(""); // Reset column when board changes

    try {
      await api.put(`/settings/kanbanDefaultBoard`, { value });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleKanbanDefaultColumnChange = async (e) => {
    const value = e.target.value;
    setKanbanDefaultColumn(value);

    try {
      await api.put(`/settings/kanbanDefaultColumn`, { value });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Container className={classes.container} maxWidth="sm">
        <Typography variant="body2" gutterBottom>
          {i18n.t("settings.title")}
        </Typography>
        <Paper className={classes.paper}>
          <Typography variant="body1">
            {i18n.t("settings.settings.userCreation.name")}
          </Typography>
          <Select
            margin="dense"
            variant="outlined"
            native
            id="userCreation-setting"
            name="userCreation"
            value={
              settings && settings.length > 0
                ? getSettingValue("userCreation")
                : ""
            }
            className={classes.settingOption}
            onChange={handleChangeSetting}
          >
            <option value="enabled">
              {i18n.t("settings.settings.userCreation.options.enabled")}
            </option>
            <option value="disabled">
              {i18n.t("settings.settings.userCreation.options.disabled")}
            </option>
          </Select>
        </Paper>

        <Paper className={classes.paper}>
          <TextField
            id="api-token-setting"
            readonly
            label="Token Api"
            margin="dense"
            variant="outlined"
            fullWidth
            value={
              settings && settings.length > 0
                ? getSettingValue("userApiToken")
                : ""
            }
          />
        </Paper>

        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Configurações do Kanban
          </Typography>

          <Box className={classes.settingOption} mb={2}>
            <Typography variant="body1" gutterBottom>
              Adicionar novos tickets automaticamente ao Kanban
            </Typography>
            <FormControl variant="outlined" margin="dense" fullWidth>
              <InputLabel>Adição Automática</InputLabel>
              <Select
                value={kanbanAutoAdd}
                onChange={handleKanbanAutoAddChange}
                label="Adição Automática"
              >
                <MenuItem value="enabled">Habilitado</MenuItem>
                <MenuItem value="disabled">Desabilitado</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {kanbanAutoAdd === "enabled" && (
            <>
              <Box className={classes.settingOption} mb={2}>
                <Typography variant="body1" gutterBottom>
                  Quadro padrão para novos tickets
                </Typography>
                <FormControl variant="outlined" margin="dense" fullWidth>
                  <InputLabel>Quadro Padrão</InputLabel>
                  <Select
                    value={kanbanDefaultBoard}
                    onChange={handleKanbanDefaultBoardChange}
                    label="Quadro Padrão"
                    disabled={kanbanLoading}
                  >
                    <MenuItem value="">
                      <em>Selecione um quadro</em>
                    </MenuItem>
                    {kanbanBoards.map((board) => (
                      <MenuItem key={board.id} value={board.id}>
                        {board.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {kanbanDefaultBoard && (
                <Box className={classes.settingOption} mb={2}>
                  <Typography variant="body1" gutterBottom>
                    Coluna padrão para novos tickets
                  </Typography>
                  <FormControl variant="outlined" margin="dense" fullWidth>
                    <InputLabel>Coluna Padrão</InputLabel>
                    <Select
                      value={kanbanDefaultColumn}
                      onChange={handleKanbanDefaultColumnChange}
                      label="Coluna Padrão"
                    >
                      <MenuItem value="">
                        <em>Selecione uma coluna</em>
                      </MenuItem>
                      {getKanbanColumns(parseInt(kanbanDefaultBoard)).map(
                        (column) => (
                          <MenuItem key={column.id} value={column.id}>
                            {column.name}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default Settings;
