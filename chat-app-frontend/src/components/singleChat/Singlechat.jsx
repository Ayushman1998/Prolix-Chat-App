import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Lottie from "lottie-react";
import { getSender, getSenderFull } from "../../config/ChatLogics";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "../profileModal.js/ProfileModal";
import ScrollableChat from "../scrollableChat/ScrollableChat";
import UpdateGroupChatModal from "../updateGroupChatModal/UpdateGroupChatModal";
import typingAnimation from "../../animation/typing.json";

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

function Singlechat({ fetchAgain, setFetchAgain }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessages, setNewMessages] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const toast = useToast();
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/message/fetch-messages/${selectedChat._id}`,
        { withCredentials: true }
      );

      setMessages(response.data.data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error occured!",
        description: "Failed to load the message",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", (room) => {
      if (selectedChatCompare._id === room) {
        setIsTyping(true);
      }
    });
    socket.on("stop typing", (room) => {
      if (selectedChatCompare._id === room) {
        setIsTyping(false);
      }
    });
  }, []);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // notification
        if(!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessages) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const response = await axios.post(
          "http://localhost:5000/message/send-message",
          { content: newMessages, chatId: selectedChat._id },
          { withCredentials: true }
        );

        socket.emit("new message", response.data.data);
        setNewMessages("");
        setMessages([...messages, response.data.data]);
      } catch (error) {
        toast({
          title: "Error occured!",
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessages(e.target.value);

    if (!socketConnected) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && !typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily={"Work sans"}
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.participants)}
                <ProfileModal
                  user={getSenderFull(user, selectedChat.participants)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir="column"
            justifyContent={"flex-end"}
            p={3}
            bg="#E8E8E8"
            w="100%"
            h={"100%"}
            borderRadius="lg"
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf="center"
                margin={"auto"}
              />
            ) : (
              <Box display={"flex"} flexDir="column" overflowY={"scroll"}>
                <ScrollableChat messages={messages} />
              </Box>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <div style={{ maxWidth: "50px" }}>
                  <Lottie animationData={typingAnimation} loop={true} />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant={"filled"}
                bg="#E0E0E0"
                placeholder="Message"
                onChange={typingHandler}
                value={newMessages}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems="center"
          justifyContent={"center"}
          h="100%"
        >
          <Text fontSize={"3xl"} pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default Singlechat;
