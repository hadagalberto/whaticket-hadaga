import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    flex: 1,
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const AiAgentSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  provider: Yup.string().required("Required"),
  apiKey: Yup.string().required("Required"),
  model: Yup.string().required("Required"),
  queueId: Yup.number().required("Required"),
});

const AiAgentModal = ({ open, onClose, aiAgentId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    provider: "openai",
    apiKey: "",
    model: "",
    systemPrompt: "",
    temperature: 0.7,
    maxTokens: 1000,
    isActive: true,
    queueId: "",
  };

  const [aiAgent, setAiAgent] = useState(initialState);
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(err);
      }
    };
    fetchQueues();
  }, []);

  useEffect(() => {
    const fetchAiAgent = async () => {
      if (!aiAgentId) return;
      try {
        const { data } = await api.get(`/ai-agents/${aiAgentId}`);
        setAiAgent((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        toastError(err);
      }
    };

    fetchAiAgent();
  }, [aiAgentId, open]);

  const handleClose = () => {
    onClose();
    setAiAgent(initialState);
  };

  const handleSaveAiAgent = async (values) => {
    try {
      if (aiAgentId) {
        await api.put(`/ai-agents/${aiAgentId}`, values);
      } else {
        await api.post("/ai-agents", values);
      }
      toast.success(i18n.t("aiAgentModal.success"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const getModelOptions = (provider) => {
    switch (provider) {
      case "openai":
        return [
          { value: "gpt-4", label: "GPT-4" },
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
        ];
      case "gemini":
        return [
          { value: "gemini-pro", label: "Gemini Pro" },
          { value: "gemini-pro-vision", label: "Gemini Pro Vision" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {aiAgentId
            ? `${i18n.t("aiAgentModal.title.edit")}`
            : `${i18n.t("aiAgentModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={aiAgent}
          enableReinitialize={true}
          validationSchema={AiAgentSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveAiAgent(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.root}>
                  <Field
                    as={TextField}
                    label={i18n.t("aiAgentModal.form.name")}
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  <FormControl
                    variant="outlined"
                    className={classes.textField}
                    margin="dense"
                  >
                    <InputLabel>
                      {i18n.t("aiAgentModal.form.provider")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("aiAgentModal.form.provider")}
                      name="provider"
                      error={touched.provider && Boolean(errors.provider)}
                      onChange={(e) => {
                        setFieldValue("provider", e.target.value);
                        setFieldValue("model", ""); // Reset model when provider changes
                      }}
                    >
                      <MenuItem value="openai">OpenAI</MenuItem>
                      <MenuItem value="gemini">Google Gemini</MenuItem>
                    </Field>
                  </FormControl>
                </div>
                <div className={classes.root}>
                  <Field
                    as={TextField}
                    label={i18n.t("aiAgentModal.form.apiKey")}
                    name="apiKey"
                    type="password"
                    error={touched.apiKey && Boolean(errors.apiKey)}
                    helperText={touched.apiKey && errors.apiKey}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  <FormControl
                    variant="outlined"
                    className={classes.textField}
                    margin="dense"
                  >
                    <InputLabel>{i18n.t("aiAgentModal.form.model")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("aiAgentModal.form.model")}
                      name="model"
                      error={touched.model && Boolean(errors.model)}
                    >
                      {getModelOptions(values.provider).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </div>
                <FormControl
                  variant="outlined"
                  className={classes.textField}
                  margin="dense"
                >
                  <InputLabel>{i18n.t("aiAgentModal.form.queue")}</InputLabel>
                  <Field
                    as={Select}
                    label={i18n.t("aiAgentModal.form.queue")}
                    name="queueId"
                    error={touched.queueId && Boolean(errors.queueId)}
                  >
                    {queues.map((queue) => (
                      <MenuItem key={queue.id} value={queue.id}>
                        {queue.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
                <Field
                  as={TextField}
                  label={i18n.t("aiAgentModal.form.systemPrompt")}
                  name="systemPrompt"
                  multiline
                  rows={4}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
                <div className={classes.root}>
                  <div className={classes.textField}>
                    <Typography gutterBottom>
                      {i18n.t("aiAgentModal.form.temperature")}:{" "}
                      {values.temperature}
                    </Typography>
                    <Slider
                      value={values.temperature}
                      onChange={(event, newValue) =>
                        setFieldValue("temperature", newValue)
                      }
                      step={0.1}
                      min={0}
                      max={2}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </div>
                </div>
                <Field
                  as={TextField}
                  label={i18n.t("aiAgentModal.form.maxTokens")}
                  name="maxTokens"
                  type="number"
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isActive}
                      onChange={(e) =>
                        setFieldValue("isActive", e.target.checked)
                      }
                      name="isActive"
                      color="primary"
                    />
                  }
                  label={i18n.t("aiAgentModal.form.isActive")}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("aiAgentModal.buttons.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={classes.btnWrapper}
                  >
                    {aiAgentId
                      ? `${i18n.t("aiAgentModal.buttons.okEdit")}`
                      : `${i18n.t("aiAgentModal.buttons.okAdd")}`}
                  </Button>
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default AiAgentModal;
