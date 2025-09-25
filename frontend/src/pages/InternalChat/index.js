import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Button,
  makeStyles,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import format from "date-fns/format";
import { enUS, ptBR as dateFnsPtBR, es as esLocale } from "date-fns/locale";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import openSocket from "../../services/socket-io";
import {
  fetchInternalChatMessages,
  sendInternalChatMessage,
} from "../../services/internalChat";

const useStyles = makeStyles((theme) => ({
  chatCard: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 10px 25px rgba(0,0,0,0.35)"
        : "0 10px 25px rgba(99,102,241,0.12)",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 200px)",
  },
  messagesWrapper: {
    flex: 1,
    overflowY: "auto",
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  loadMoreWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(2),
  },
  messageRow: {
    display: "flex",
    marginBottom: theme.spacing(1.5),
  },
  ownMessageRow: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: theme.spacing(1.5),
    borderRadius: 16,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 8px 20px rgba(0,0,0,0.35)"
        : "0 8px 20px rgba(99,102,241,0.12)",
    display: "flex",
    flexDirection: "column",
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.background.default
        : theme.palette.background.paper,
  },
  ownMessageBubble: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.5),
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  messageBody: {
    whiteSpace: "pre-wrap",
    fontSize: "0.95rem",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: theme.spacing(1),
  },
  textField: {
    flex: 1,
  },
  emptyState: {
    textAlign: "center",
    marginTop: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
}));

const InternalChat = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [language, setLanguage] = useState(i18n.language || "en");
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleLanguageChange = (lng) => setLanguage(lng || "en");
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  const dateLocale = useMemo(() => {
    if (!language) return enUS;
    if (language.startsWith("pt")) {
      return dateFnsPtBR;
    }
    if (language.startsWith("es")) {
      return esLocale;
    }
    return enUS;
  }, [language]);

  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const loadMessages = useCallback(
    async (
      requestedPage = 1,
      options = { reset: false, prepend: false, scroll: false }
    ) => {
      setLoading(true);
      try {
        const data = await fetchInternalChatMessages({
          pageNumber: requestedPage,
        });

        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((msg) => msg.id));

          if (options.reset) {
            return data.messages;
          }

          const newMessages = data.messages.filter(
            (msg) => !existingIds.has(msg.id)
          );

          if (options.prepend) {
            return [...newMessages, ...prevMessages];
          }

          return [...prevMessages, ...newMessages];
        });

        setHasMore(data.hasMore);
        setPageNumber(requestedPage);

        if (options.scroll) {
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    },
    [scrollToBottom]
  );

  useEffect(() => {
    loadMessages(1, { reset: true, scroll: true });
  }, [loadMessages]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinInternalChat"));

    socket.on("internalChat", (data) => {
      if (data.action === "create") {
        setMessages((prevMessages) => {
          if (prevMessages.some((message) => message.id === data.message.id)) {
            return prevMessages;
          }
          return [...prevMessages, data.message];
        });
        setTimeout(scrollToBottom, 100);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [scrollToBottom]);

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    await loadMessages(pageNumber + 1, { prepend: true });
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!messageBody.trim()) {
      return;
    }

    setSending(true);
    try {
      await sendInternalChatMessage(messageBody);
      setMessageBody("");
    } catch (err) {
      toastError(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  const renderMessage = (message) => {
    const isOwnMessage = Number(user?.id) === Number(message.userId);
    const userName =
      message.user?.name || i18n.t("internalChat.messages.unknownUser");
    const timestamp = format(new Date(message.createdAt), "dd/MM/yyyy HH:mm", {
      locale: dateLocale,
    });

    return (
      <div
        key={message.id}
        className={`${classes.messageRow} ${
          isOwnMessage ? classes.ownMessageRow : ""
        }`}
      >
        <div
          className={`${classes.messageBubble} ${
            isOwnMessage ? classes.ownMessageBubble : ""
          }`}
        >
          <div className={classes.messageHeader}>
            <span>{userName}</span>
            <span>{timestamp}</span>
          </div>
          <Typography component="p" className={classes.messageBody}>
            {message.body}
          </Typography>
        </div>
      </div>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("internalChat.title")}</Title>
        <MainHeaderButtonsWrapper>
          {loading && <CircularProgress size={20} />}
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.chatCard} variant="outlined">
        <div className={classes.messagesWrapper}>
          {hasMore && (
            <div className={classes.loadMoreWrapper}>
              <Button onClick={handleLoadMore} disabled={loading} size="small">
                {loading
                  ? i18n.t("internalChat.actions.loading")
                  : i18n.t("internalChat.actions.loadMore")}
              </Button>
            </div>
          )}

          {messages.length === 0 && !loading ? (
            <Typography className={classes.emptyState}>
              {i18n.t("internalChat.emptyState")}
            </Typography>
          ) : (
            messages.map((message) => renderMessage(message))
          )}
          <div ref={bottomRef} />
        </div>

        <form className={classes.inputWrapper} onSubmit={handleSendMessage}>
          <TextField
            className={classes.textField}
            variant="outlined"
            multiline
            rows={2}
            rowsMax={6}
            placeholder={i18n.t("internalChat.input.placeholder")}
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
            onKeyDown={handleKeyPress}
            disabled={sending}
          />
          <IconButton
            color="primary"
            type="submit"
            disabled={sending || !messageBody.trim()}
          >
            {sending ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default InternalChat;
