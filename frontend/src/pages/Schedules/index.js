import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Tooltip,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft,
  ChevronRight,
} from "@material-ui/icons";
import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import addDays from "date-fns/addDays";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import isSameMonth from "date-fns/isSameMonth";
import isSameDay from "date-fns/isSameDay";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../../components/ConfirmationModal";
import ServiceTypeModal from "../../components/Schedules/ServiceTypeModal";
import AppointmentModal from "../../components/Schedules/AppointmentModal";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  calendarCard: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 10px 30px rgba(0,0,0,0.35)"
        : "0 10px 30px rgba(99,102,241,0.12)",
    height: "100%",
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: theme.spacing(1),
  },
  calendarCell: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    minHeight: 92,
    border: `1px solid ${theme.palette.divider}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
  },
  outsideMonth: {
    opacity: 0.4,
  },
  selectedDay: {
    borderColor: theme.palette.primary.main,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 0 0 2px rgba(99,102,241,0.4)"
        : "0 0 0 2px rgba(99,102,241,0.2)",
  },
  cellHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  appointmentIndicator: {
    marginTop: "auto",
    display: "flex",
    gap: theme.spacing(0.5),
    flexWrap: "wrap",
  },
  weekdayLabel: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0.5),
    fontWeight: 600,
  },
  serviceTypeCard: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 10px 25px rgba(0,0,0,0.35)"
        : "0 10px 25px rgba(99,102,241,0.12)",
    height: "100%",
  },
  dayAppointmentsCard: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 10px 25px rgba(0,0,0,0.35)"
        : "0 10px 25px rgba(99,102,241,0.12)",
    marginTop: theme.spacing(2),
  },
  appointmentItem: {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
  },
  colorBadge: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginRight: theme.spacing(1),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
}));

const weekdays = [
  i18n.t("schedules.weekdays.sun"),
  i18n.t("schedules.weekdays.mon"),
  i18n.t("schedules.weekdays.tue"),
  i18n.t("schedules.weekdays.wed"),
  i18n.t("schedules.weekdays.thu"),
  i18n.t("schedules.weekdays.fri"),
  i18n.t("schedules.weekdays.sat"),
];

const formatDateKey = (date) => format(date, "yyyy-MM-dd");

const Schedules = () => {
  const classes = useStyles();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [serviceTypes, setServiceTypes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [serviceTypeModalOpen, setServiceTypeModalOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState(null);
  const [serviceTypeToDelete, setServiceTypeToDelete] = useState(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [defaultAppointmentDate, setDefaultAppointmentDate] = useState(null);

  const monthRange = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return {
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    };
  }, [currentMonth]);

  const loadServiceTypes = useCallback(async () => {
    setLoadingServiceTypes(true);
    try {
      const { data } = await api.get("/service-types");
      setServiceTypes(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingServiceTypes(false);
    }
  }, []);

  const loadAppointments = useCallback(async (startDate, endDate) => {
    setLoadingAppointments(true);
    try {
      const { data } = await api.get("/appointments", {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });

      const formatted = data.map((item) => ({
        ...item,
        scheduledAt:
          typeof item.scheduledAt === "string"
            ? new Date(item.scheduledAt)
            : item.scheduledAt,
        endAt:
          typeof item.endAt === "string" ? new Date(item.endAt) : item.endAt,
      }));

      setAppointments(formatted);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    loadServiceTypes();
  }, [loadServiceTypes]);

  useEffect(() => {
    loadAppointments(monthRange.start, monthRange.end);
  }, [monthRange, loadAppointments]);

  useEffect(() => {
    setSelectedDate((prev) => {
      if (prev && isSameMonth(prev, currentMonth)) {
        return prev;
      }
      return currentMonth;
    });
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const days = [];
    let day = monthRange.start;
    while (day <= monthRange.end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [monthRange]);

  const appointmentsByDay = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      const key = formatDateKey(new Date(appointment.scheduledAt));
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(appointment);
    });
    return map;
  }, [appointments]);

  const appointmentsForSelectedDay = useMemo(() => {
    return appointments
      .filter((appointment) => isSameDay(appointment.scheduledAt, selectedDate))
      .sort((a, b) => a.scheduledAt - b.scheduledAt);
  }, [appointments, selectedDate]);

  const handleOpenServiceTypeModal = (serviceType) => {
    setEditingServiceType(serviceType || null);
    setServiceTypeModalOpen(true);
  };

  const handleCloseServiceTypeModal = (shouldReload) => {
    setServiceTypeModalOpen(false);
    setEditingServiceType(null);
    if (shouldReload) {
      loadServiceTypes();
    }
  };

  const handleDeleteServiceType = async () => {
    if (!serviceTypeToDelete) return;
    try {
      await api.delete(`/service-types/${serviceTypeToDelete.id}`);
      setServiceTypeToDelete(null);
      loadServiceTypes();
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenAppointmentModal = (appointment, date) => {
    setEditingAppointment(appointment || null);
    const baseDate = date || selectedDate || new Date();
    const start = setMinutes(setHours(baseDate, 9), 0);
    setDefaultAppointmentDate(start);
    setAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = (shouldReload) => {
    setAppointmentModalOpen(false);
    setEditingAppointment(null);
    if (shouldReload) {
      loadAppointments(monthRange.start, monthRange.end);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      await api.delete(`/appointments/${appointmentToDelete.id}`);
      setAppointmentToDelete(null);
      loadAppointments(monthRange.start, monthRange.end);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          serviceTypeToDelete &&
          i18n.t("schedules.serviceTypeModal.confirmDelete", {
            name: serviceTypeToDelete.name,
          })
        }
        open={Boolean(serviceTypeToDelete)}
        onClose={() => setServiceTypeToDelete(null)}
        onConfirm={handleDeleteServiceType}
      >
        {i18n.t("schedules.serviceTypeModal.confirmDeleteMessage")}
      </ConfirmationModal>

      <ConfirmationModal
        title={
          appointmentToDelete &&
          i18n.t("schedules.appointmentModal.confirmDelete", {
            name: appointmentToDelete.customerName,
          })
        }
        open={Boolean(appointmentToDelete)}
        onClose={() => setAppointmentToDelete(null)}
        onConfirm={handleDeleteAppointment}
      >
        {i18n.t("schedules.appointmentModal.confirmDeleteMessage")}
      </ConfirmationModal>

      <ServiceTypeModal
        open={serviceTypeModalOpen}
        onClose={handleCloseServiceTypeModal}
        serviceType={editingServiceType}
      />

      <AppointmentModal
        open={appointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        serviceTypes={serviceTypes}
        appointment={editingAppointment}
        defaultDate={defaultAppointmentDate}
      />

      <MainHeader>
        <Title>{i18n.t("schedules.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAppointmentModal(null, selectedDate)}
            disabled={serviceTypes.length === 0}
          >
            {i18n.t("schedules.actions.newAppointment")}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleOpenServiceTypeModal(null)}
          >
            {i18n.t("schedules.actions.newServiceType")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper className={classes.calendarCard} variant="outlined">
            <div className={classes.calendarHeader}>
              <div>
                <IconButton
                  aria-label={i18n.t("schedules.calendar.previous")}
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  aria-label={i18n.t("schedules.calendar.next")}
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight />
                </IconButton>
              </div>
              <Typography variant="h6">
                {format(currentMonth, "MMMM yyyy")}
              </Typography>
              <Button onClick={() => setCurrentMonth(startOfMonth(new Date()))}>
                {i18n.t("schedules.calendar.today")}
              </Button>
            </div>
            <div className={classes.calendarGrid}>
              {weekdays.map((day) => (
                <Typography key={day} className={classes.weekdayLabel}>
                  {day}
                </Typography>
              ))}
            </div>
            <div className={classes.calendarGrid}>
              {calendarDays.map((day) => {
                const key = formatDateKey(day);
                const dayAppointments = appointmentsByDay.get(key) || [];
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div
                    key={key}
                    className={`${classes.calendarCell} ${
                      !isSameMonth(day, currentMonth)
                        ? classes.outsideMonth
                        : ""
                    } ${isSelected ? classes.selectedDay : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={classes.cellHeader}>
                      <Typography variant="subtitle2">
                        {format(day, "d")}
                      </Typography>
                      {dayAppointments.length > 0 && (
                        <Chip
                          label={dayAppointments.length}
                          size="small"
                          color="primary"
                        />
                      )}
                    </div>
                    <div className={classes.appointmentIndicator}>
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <Tooltip
                          key={appointment.id}
                          title={`${format(
                            appointment.scheduledAt,
                            "HH:mm"
                          )} - ${appointment.customerName}`}
                        >
                          <span
                            className={classes.colorBadge}
                            style={{
                              backgroundColor:
                                appointment.serviceType?.color || "#6366f1",
                            }}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Paper>

          <Paper className={classes.dayAppointmentsCard} variant="outlined">
            <Typography variant="h6">
              {i18n.t("schedules.dayOverview.title", {
                date: format(selectedDate, "PPPP"),
              })}
            </Typography>
            <Divider style={{ margin: "16px 0" }} />
            {loadingAppointments ? (
              <div className={classes.loadingContainer}>
                <CircularProgress size={24} />
              </div>
            ) : appointmentsForSelectedDay.length === 0 ? (
              <Typography color="textSecondary">
                {i18n.t("schedules.dayOverview.empty")}
              </Typography>
            ) : (
              <List>
                {appointmentsForSelectedDay.map((appointment) => (
                  <ListItem
                    key={appointment.id}
                    className={classes.appointmentItem}
                    button
                    onClick={() => handleOpenAppointmentModal(appointment)}
                  >
                    <ListItemText
                      primary={`${format(appointment.scheduledAt, "HH:mm")} - ${
                        appointment.customerName
                      }`}
                      secondary={
                        appointment.serviceType
                          ? `${appointment.serviceType.name} • ${
                              appointment.duration
                            } ${i18n.t("schedules.dayOverview.minutes")}`
                          : `${appointment.duration} ${i18n.t(
                              "schedules.dayOverview.minutes"
                            )}`
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenAppointmentModal(appointment)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => setAppointmentToDelete(appointment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper className={classes.serviceTypeCard} variant="outlined">
            <Typography variant="h6">
              {i18n.t("schedules.serviceTypes.title")}
            </Typography>
            <Divider style={{ margin: "16px 0" }} />
            {loadingServiceTypes ? (
              <div className={classes.loadingContainer}>
                <CircularProgress size={24} />
              </div>
            ) : serviceTypes.length === 0 ? (
              <Typography color="textSecondary">
                {i18n.t("schedules.serviceTypes.empty")}
              </Typography>
            ) : (
              <List>
                {serviceTypes.map((serviceType) => (
                  <ListItem key={serviceType.id} divider>
                    <ListItemText
                      primary={serviceType.name}
                      secondary={i18n.t("schedules.serviceTypes.duration", {
                        duration: serviceType.duration,
                      })}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleOpenServiceTypeModal(serviceType)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setServiceTypeToDelete(serviceType)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </MainContainer>
  );
};

export default Schedules;
