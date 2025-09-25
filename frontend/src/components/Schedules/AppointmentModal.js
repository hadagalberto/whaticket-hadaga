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
  MenuItem,
  makeStyles,
} from "@material-ui/core";
import formatISO from "date-fns/formatISO";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  textField: {
    marginTop: theme.spacing(1),
  },
}));

const validationSchema = Yup.object().shape({
  customerName: Yup.string()
    .trim()
    .required(i18n.t("schedules.appointmentModal.errors.customerName")),
  serviceTypeId: Yup.number().required(
    i18n.t("schedules.appointmentModal.errors.serviceType")
  ),
  scheduledAt: Yup.string().required(
    i18n.t("schedules.appointmentModal.errors.scheduledAt")
  ),
  duration: Yup.number()
    .typeError(i18n.t("schedules.appointmentModal.errors.duration"))
    .min(5, i18n.t("schedules.appointmentModal.errors.duration"))
    .max(24 * 60, i18n.t("schedules.appointmentModal.errors.durationMax"))
    .notRequired(),
});

const statusOptions = [
  { value: "scheduled", label: i18n.t("schedules.status.scheduled") },
  { value: "confirmed", label: i18n.t("schedules.status.confirmed") },
  { value: "completed", label: i18n.t("schedules.status.completed") },
  { value: "canceled", label: i18n.t("schedules.status.canceled") },
];

const toLocalDateTimeInput = (date) => {
  if (!date) return "";
  const asDate = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(asDate.getTime())) return "";
  const offset = asDate.getTimezoneOffset();
  const localDate = new Date(asDate.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const AppointmentModal = ({
  open,
  onClose,
  serviceTypes,
  appointment,
  defaultDate,
}) => {
  const classes = useStyles();

  const initialValues = {
    customerName: appointment?.customerName || "",
    customerContact: appointment?.customerContact || "",
    location: appointment?.location || "",
    notes: appointment?.notes || "",
    serviceTypeId: appointment?.serviceTypeId || serviceTypes?.[0]?.id || "",
    scheduledAt:
      toLocalDateTimeInput(appointment?.scheduledAt || defaultDate) || "",
    duration: appointment?.duration || "",
    status: appointment?.status || "scheduled",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        serviceTypeId: Number(values.serviceTypeId),
        duration: values.duration ? Number(values.duration) : undefined,
        scheduledAt: formatISO(new Date(values.scheduledAt)),
      };

      if (appointment?.id) {
        await api.put(`/appointments/${appointment.id}`, payload);
        toast.success(i18n.t("schedules.appointmentModal.toasts.updated"));
      } else {
        await api.post("/appointments", payload);
        toast.success(i18n.t("schedules.appointmentModal.toasts.created"));
      }

      onClose(true);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>
        {appointment?.id
          ? i18n.t("schedules.appointmentModal.title.edit")
          : i18n.t("schedules.appointmentModal.title.create")}
      </DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, touched, errors, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Field
                as={TextField}
                name="customerName"
                label={i18n.t("schedules.appointmentModal.form.customerName")}
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.customerName}
                error={touched.customerName && Boolean(errors.customerName)}
                helperText={touched.customerName && errors.customerName}
              />
              <Field
                as={TextField}
                name="customerContact"
                label={i18n.t(
                  "schedules.appointmentModal.form.customerContact"
                )}
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.customerContact}
                className={classes.textField}
              />
              <Field
                as={TextField}
                name="serviceTypeId"
                select
                label={i18n.t("schedules.appointmentModal.form.serviceType")}
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.serviceTypeId}
                error={touched.serviceTypeId && Boolean(errors.serviceTypeId)}
                helperText={touched.serviceTypeId && errors.serviceTypeId}
                className={classes.textField}
              >
                {serviceTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Field>
              <Field
                as={TextField}
                name="scheduledAt"
                type="datetime-local"
                label={i18n.t("schedules.appointmentModal.form.scheduledAt")}
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.scheduledAt}
                error={touched.scheduledAt && Boolean(errors.scheduledAt)}
                helperText={touched.scheduledAt && errors.scheduledAt}
                className={classes.textField}
              />
              <Field
                as={TextField}
                name="duration"
                type="number"
                label={i18n.t("schedules.appointmentModal.form.duration")}
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.duration}
                helperText={
                  (touched.duration && errors.duration) ||
                  i18n.t("schedules.appointmentModal.form.durationHelper")
                }
                className={classes.textField}
              />
              <Field
                as={TextField}
                name="status"
                select
                label={i18n.t("schedules.appointmentModal.form.status")}
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.status}
                className={classes.textField}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field>
              <Field
                as={TextField}
                name="location"
                label={i18n.t("schedules.appointmentModal.form.location")}
                variant="outlined"
                margin="dense"
                fullWidth
                value={values.location}
                className={classes.textField}
              />
              <Field
                as={TextField}
                name="notes"
                label={i18n.t("schedules.appointmentModal.form.notes")}
                variant="outlined"
                margin="dense"
                fullWidth
                multiline
                rows={3}
                value={values.notes}
                className={classes.textField}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onClose(false)} color="secondary">
                {i18n.t("schedules.appointmentModal.actions.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={isSubmitting || serviceTypes.length === 0}
              >
                {appointment?.id
                  ? i18n.t("schedules.appointmentModal.actions.save")
                  : i18n.t("schedules.appointmentModal.actions.create")}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

AppointmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  serviceTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  appointment: PropTypes.shape({
    id: PropTypes.number,
    customerName: PropTypes.string,
    customerContact: PropTypes.string,
    serviceTypeId: PropTypes.number,
    duration: PropTypes.number,
    status: PropTypes.string,
    scheduledAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
  defaultDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
};

AppointmentModal.defaultProps = {
  serviceTypes: [],
  appointment: null,
  defaultDate: null,
};

export default AppointmentModal;
