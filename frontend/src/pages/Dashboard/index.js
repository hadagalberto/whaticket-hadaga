import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

// Icons
import PhoneIcon from "@material-ui/icons/Phone";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import TimerIcon from "@material-ui/icons/Timer";

import useTickets from "../../hooks/useTickets";
import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";

import Chart from "./Chart";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  filterSection: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
  filterForm: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  filterButton: {
    backgroundColor: "#28a745",
    color: "white",
    "&:hover": {
      backgroundColor: "#218838",
    },
  },
  statCard: {
    height: 120,
    display: "flex",
    position: "relative",
    overflow: "hidden",
  },
  statCardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(2),
    color: "white",
    position: "relative",
    zIndex: 2,
  },
  statCardIcon: {
    position: "absolute",
    right: theme.spacing(2),
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 60,
    opacity: 0.3,
    zIndex: 1,
  },
  statNumber: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "1rem",
    marginTop: theme.spacing(1),
  },
  // Card Colors
  cardGreen: {
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
  },
  cardBlue: {
    background: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
  },
  cardRed: {
    background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
  },
  cardOrange: {
    background: "linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)",
  },
  cardBrown: {
    background: "linear-gradient(135deg, #6f4e37 0%, #8b4513 100%)",
  },
  cardPurple: {
    background: "linear-gradient(135deg, #6f42c1 0%, #563d7c 100%)",
  },
  chartPaper: {
    padding: theme.spacing(2),
    height: 400,
  },
  tableSection: {
    marginTop: theme.spacing(3),
  },
  userTable: {
    marginTop: theme.spacing(2),
  },
  statusOnline: {
    color: "#28a745",
    fontSize: "1.2rem",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  // Filter states
  const [filterType, setFilterType] = useState("date");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState("");

  // Data states
  const [dashboardData, setDashboardData] = useState({
    conversations: 0,
    waiting: 0,
    finished: 0,
    newContacts: 0,
    avgConversationTime: "00h 00m",
    avgWaitTime: "00h 00m",
  });
  const [users, setUsers] = useState([]);

  var userQueueIds = [];
  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  const GetTickets = (status, showAll, withUnreadMessages) => {
    const { count } = useTickets({
      status: status,
      showAll: showAll,
      withUnreadMessages: withUnreadMessages,
      queueIds: JSON.stringify(userQueueIds),
    });
    return count;
  };

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users data
        const { data: usersData } = await api.get("/users");
        setUsers(usersData.users || []);

        // Update dashboard stats
        setDashboardData({
          conversations: GetTickets("open", "true", "false"),
          waiting: GetTickets("pending", "true", "false"),
          finished: GetTickets("closed", "true", "false"),
          newContacts: 0, // You can implement this based on your logic
          avgConversationTime: "00h 00m",
          avgWaitTime: "00h 00m",
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    // Implement filtering logic here
    console.log("Filtering data:", {
      filterType,
      startDate,
      endDate,
      selectedPeriod,
    });
  };

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        {/* Filter Section */}
        <Paper className={classes.filterSection}>
          <Box className={classes.filterForm}>
            <FormControl
              variant="outlined"
              size="small"
              style={{ minWidth: 200 }}
            >
              <InputLabel>Tipo de Filtro</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Tipo de Filtro"
              >
                <MenuItem value="date">Filtro por Data</MenuItem>
                <MenuItem value="period">Selecione o período desejado</MenuItem>
              </Select>
            </FormControl>

            {filterType === "date" && (
              <>
                <TextField
                  label="Data Inicial"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Data Final"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {filterType === "period" && (
              <FormControl
                variant="outlined"
                size="small"
                style={{ minWidth: 200 }}
              >
                <InputLabel>Selecione o período desejado</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  label="Selecione o período desejado"
                >
                  <MenuItem value="today">Hoje</MenuItem>
                  <MenuItem value="yesterday">Ontem</MenuItem>
                  <MenuItem value="week">Esta semana</MenuItem>
                  <MenuItem value="month">Este mês</MenuItem>
                </Select>
              </FormControl>
            )}

            <Button
              variant="contained"
              className={classes.filterButton}
              onClick={handleFilter}
            >
              FILTRAR
            </Button>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={`${classes.statCard} ${classes.cardGreen}`}>
              <CardContent className={classes.statCardContent}>
                <Typography className={classes.statNumber}>
                  {GetTickets("open", "true", "false")}
                </Typography>
                <Typography className={classes.statLabel}>
                  Em Conversa
                </Typography>
                <PhoneIcon className={classes.statCardIcon} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={`${classes.statCard} ${classes.cardBlue}`}>
              <CardContent className={classes.statCardContent}>
                <Typography className={classes.statNumber}>
                  {GetTickets("pending", "true", "false")}
                </Typography>
                <Typography className={classes.statLabel}>
                  Aguardando
                </Typography>
                <HourglassEmptyIcon className={classes.statCardIcon} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={`${classes.statCard} ${classes.cardRed}`}>
              <CardContent className={classes.statCardContent}>
                <Typography className={classes.statNumber}>
                  {GetTickets("closed", "true", "false")}
                </Typography>
                <Typography className={classes.statLabel}>
                  Finalizados
                </Typography>
                <CheckCircleIcon className={classes.statCardIcon} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={`${classes.statCard} ${classes.cardOrange}`}>
              <CardContent className={classes.statCardContent}>
                <Typography className={classes.statNumber}>
                  {dashboardData.newContacts}
                </Typography>
                <Typography className={classes.statLabel}>
                  Novos Contatos
                </Typography>
                <PersonAddIcon className={classes.statCardIcon} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={`${classes.statCard} ${classes.cardBrown}`}>
              <CardContent className={classes.statCardContent}>
                <Typography className={classes.statNumber}>
                  {dashboardData.avgConversationTime}
                </Typography>
                <Typography className={classes.statLabel}>
                  T.M. de Conversa
                </Typography>
                <AccessTimeIcon className={classes.statCardIcon} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card className={`${classes.statCard} ${classes.cardPurple}`}>
              <CardContent className={classes.statCardContent}>
                <Typography className={classes.statNumber}>
                  {dashboardData.avgWaitTime}
                </Typography>
                <Typography className={classes.statLabel}>
                  T.M. de Espera
                </Typography>
                <TimerIcon className={classes.statCardIcon} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Users Table */}
        <Paper className={classes.tableSection}>
          <TableContainer>
            <Table className={classes.userTable}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nome</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Avaliações</strong>
                  </TableCell>
                  <TableCell>
                    <strong>T.M. de Atendimento</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status (Atual)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span role="img" aria-label="stars">
                        ⭐⭐⭐
                      </span>
                    </TableCell>
                    <TableCell>00h 00m</TableCell>
                    <TableCell>
                      <span className={classes.statusOnline}>●</span>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Chart Section */}
        <Grid container spacing={3} style={{ marginTop: 16 }}>
          <Grid item xs={12}>
            <Paper className={classes.chartPaper}>
              <Typography variant="h6" gutterBottom color="textPrimary">
                Total de Conversas por Usuários
              </Typography>
              <Chart />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
