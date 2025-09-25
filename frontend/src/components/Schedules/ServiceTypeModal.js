import React from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  makeStyles,
} from "@material-ui/core";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  textField: {
    marginTop: theme.spacing(1),
  },
}));

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, i18n.t("schedules.serviceTypeModal.errors.name"))
    .required(i18n.t("schedules.serviceTypeModal.errors.name")),
  duration: Yup.number()
    .typeError(i18n.t("schedules.serviceTypeModal.errors.duration"))
    .min(5, i18n.t("schedules.serviceTypeModal.errors.duration"))
    .max(24 * 60, i18n.t("schedules.serviceTypeModal.errors.durationMax"))
    .notRequired(),
});

const ServiceTypeModal = ({ open, onClose, serviceType }) => {
  const classes = useStyles();

  const initialValues = {
    name: serviceType?.name || "",
    description: serviceType?.description || "",
    duration: serviceType?.duration || 30,
    color: serviceType?.color || "",
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        duration: values.duration ? Number(values.duration) : undefined,
      };

      if (serviceType?.id) {
        await api.put(`/service-types/${serviceType.id}`, payload);
        toast.success(i18n.t("schedules.serviceTypeModal.toasts.updated"));
      } else {
        await api.post("/service-types", payload);
        toast.success(i18n.t("schedules.serviceTypeModal.toasts.created"));
      }

      onClose(true);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>
        {serviceType?.id
          ? i18n.t("schedules.serviceTypeModal.title.edit")
          : i18n.t("schedules.serviceTypeModal.title.create")}
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, touched, errors, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Field
                as={TextField}
                label={i18n.t("schedules.serviceTypeModal.form.name")}
                name="name"
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.name}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <Field
                as={TextField}
                label={i18n.t("schedules.serviceTypeModal.form.description")}
                name="description"
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                rows={3}
                className={classes.textField}
              />
              <Field
                as={TextField}
                label={i18n.t("schedules.serviceTypeModal.form.duration")}
                name="duration"
                type="number"
                variant="outlined"
                margin="dense"
                fullWidth
                className={classes.textField}
                value={values.duration}
                error={touched.duration && Boolean(errors.duration)}
                helperText={
                  (touched.duration && errors.duration) ||
                  i18n.t("schedules.serviceTypeModal.form.durationHelper")
                }
              />
              <Field
                as={TextField}
                label={i18n.t("schedules.serviceTypeModal.form.color")}
                name="color"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="#4F46E5"
                className={classes.textField}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onClose(false)} color="secondary">
                {i18n.t("schedules.serviceTypeModal.actions.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={isSubmitting}
              >
                {serviceType?.id
                  ? i18n.t("schedules.serviceTypeModal.actions.save")
                  : i18n.t("schedules.serviceTypeModal.actions.create")}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

ServiceTypeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  serviceType: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    duration: PropTypes.number,
    color: PropTypes.string,
  }),
};

ServiceTypeModal.defaultProps = {
  serviceType: null,
};

export default ServiceTypeModal;
