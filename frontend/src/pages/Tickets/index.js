import React from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Divider } from "@material-ui/core";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  chatContainer: {
    display: "flex",
    height: "calc(100vh - 64px)",
    backgroundColor: theme.palette.background.default,
    overflow: "hidden",
  },

  sidebar: {
    width: "380px",
    minWidth: "380px",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
    boxShadow:
      theme.palette.type === "dark"
        ? "2px 0 8px rgba(0, 0, 0, 0.3)"
        : "2px 0 8px rgba(0, 0, 0, 0.1)",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      minWidth: "100%",
    },
  },

  sidebarHidden: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },

  sidebarHeader: {
    padding: "20px 24px 16px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },

  sidebarTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontFamily: '"Inter", sans-serif',
    marginBottom: "4px",
  },

  sidebarSubtitle: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontFamily: '"Inter", sans-serif',
  },

  conversationArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.default,
    position: "relative",
  },

  conversationHeader: {
    padding: "16px 24px",
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "72px",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 2px 8px rgba(0, 0, 0, 0.2)"
        : "0 2px 8px rgba(0, 0, 0, 0.06)",
  },

  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.secondary,
    padding: "40px 20px",
  },

  emptyStateIcon: {
    width: "120px",
    height: "120px",
    marginBottom: "24px",
    opacity: 0.6,
  },

  emptyStateTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "8px",
    color: theme.palette.text.primary,
    fontFamily: '"Inter", sans-serif',
  },

  emptyStateSubtitle: {
    fontSize: "1rem",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: "400px",
    fontFamily: '"Inter", sans-serif',
  },

  ticketsManagerContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  conversationContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
}));

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();

  return (
    <div className={classes.chatContainer}>
      {/* Sidebar com lista de conversas */}
      <div
        className={`${classes.sidebar} ${
          ticketId ? classes.sidebarHidden : ""
        }`}
      >
        <div className={classes.sidebarHeader}>
          <Typography className={classes.sidebarTitle}>Conversas</Typography>
          <Typography className={classes.sidebarSubtitle}>
            Gerencie todas as suas conversas de atendimento
          </Typography>
        </div>
        <div className={classes.ticketsManagerContainer}>
          <TicketsManager />
        </div>
      </div>

      {/* Área principal da conversa */}
      <div className={classes.conversationArea}>
        {ticketId ? (
          <div className={classes.conversationContent}>
            <Ticket />
          </div>
        ) : (
          <div className={classes.emptyState}>
            <svg
              className={classes.emptyStateIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <Typography className={classes.emptyStateTitle}>
              Bem-vindo ao SupportHub
            </Typography>
            <Typography className={classes.emptyStateSubtitle}>
              Selecione uma conversa na barra lateral para começar a responder
              aos seus clientes. Você pode gerenciar todas as suas conversas de
              atendimento de forma organizada e eficiente.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
