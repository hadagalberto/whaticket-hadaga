import React, { useContext, useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Badge from "@material-ui/core/Badge";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  },

  searchContainer: {
    padding: "16px 20px",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.background.default,
    borderRadius: "8px",
    padding: "8px 12px",
    border: `1px solid ${theme.palette.divider}`,
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
    },
  },

  searchIcon: {
    color: theme.palette.text.secondary,
    marginRight: "8px",
    fontSize: "1.2rem",
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    fontSize: "0.9rem",
    fontFamily: '"Inter", sans-serif',
    "&::placeholder": {
      color: theme.palette.text.secondary,
    },
  },

  filtersContainer: {
    padding: "12px 20px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },

  tabsContainer: {
    marginBottom: "12px",
  },

  tabsHeader: {
    backgroundColor: theme.palette.background.default,
    borderRadius: "8px",
    padding: "4px",
    "& .MuiTabs-indicator": {
      display: "none",
    },
  },

  tab: {
    minWidth: "auto",
    fontSize: "0.85rem",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: "6px",
    margin: "0 2px",
    fontFamily: '"Inter", sans-serif',
    "&.Mui-selected": {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      boxShadow:
        theme.palette.type === "dark"
          ? "0 2px 4px rgba(0, 0, 0, 0.3)"
          : "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },

  badge: {
    "& .MuiBadge-badge": {
      fontSize: "0.7rem",
      minWidth: "18px",
      height: "18px",
      backgroundColor: theme.palette.primary.main,
      color: "#ffffff",
    },
  },

  ticketsContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },

  newTicketButton: {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.85rem",
    padding: "8px 16px",
    boxShadow: "none",
    fontFamily: '"Inter", sans-serif',
    "&:hover": {
      boxShadow: `0 4px 12px ${theme.palette.primary.main}25`,
    },
  },

  show: {
    display: "block",
  },
  hide: {
    display: "none !important",
  },
}));

const TicketsManager = () => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
      setSearchParam("");
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  return (
    <div className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />

      {/* Search Container */}
      <div className={classes.searchContainer}>
        <div className={classes.searchBox}>
          <SearchIcon className={classes.searchIcon} />
          <input
            className={classes.searchInput}
            placeholder="Buscar conversas..."
            type="search"
            onChange={handleSearch}
            ref={searchInputRef}
          />
        </div>
      </div>

      {/* Filters Container */}
      <div className={classes.filtersContainer}>
        {/* Main Tabs */}
        <div className={classes.tabsContainer}>
          <Paper elevation={0} className={classes.tabsHeader}>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              variant="fullWidth"
              className={classes.tabs}
            >
              <Tab value={"open"} label="Abertas" className={classes.tab} />
              <Tab value={"closed"} label="Fechadas" className={classes.tab} />
              <Tab value={"search"} label="Busca" className={classes.tab} />
            </Tabs>
          </Paper>
        </div>

        {/* Action Buttons */}
        {tab !== "search" && (
          <div className={classes.ticketOptionsBox}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
              className={classes.newTicketButton}
            >
              Nova Conversa
            </Button>
            <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <FormControlLabel
                  label="Todas"
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
          </div>
        )}

        {/* Queue Filter */}
        <TicketsQueueSelect
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </div>

      {/* Tickets Container */}
      <div className={classes.ticketsContainer}>
        <TabPanel value={tab} name="open">
          {/* Sub-tabs for Open tickets */}
          <Tabs
            value={tabOpen}
            onChange={handleChangeTabOpen}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label={
                <Badge
                  className={classes.badge}
                  badgeContent={openCount}
                  color="primary"
                >
                  Em Atendimento
                </Badge>
              }
              value={"open"}
              className={classes.tab}
            />
            <Tab
              label={
                <Badge
                  className={classes.badge}
                  badgeContent={pendingCount}
                  color="secondary"
                >
                  Aguardando
                </Badge>
              }
              value={"pending"}
              className={classes.tab}
            />
          </Tabs>

          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </TabPanel>

        <TabPanel value={tab} name="closed">
          <TicketsList
            status="closed"
            showAll={true}
            selectedQueueIds={selectedQueueIds}
          />
        </TabPanel>

        <TabPanel value={tab} name="search">
          <TicketsList
            searchParam={searchParam}
            showAll={true}
            selectedQueueIds={selectedQueueIds}
          />
        </TabPanel>
      </div>
    </div>
  );
};

export default TicketsManager;
