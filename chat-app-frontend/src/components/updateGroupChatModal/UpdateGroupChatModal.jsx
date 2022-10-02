import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

function UpdateGroupChatModal({ fetchAgain, setFetchAgain, fetchMessages }) {
  const { user, selectedChat, setSelectedChat } = ChatState();

  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState();
  const [searchResult, setSearchResult] = useState();
  const [loading, setLoading] = useState();
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const handleRemove = async (userToRemove) => {
    console.log(userToRemove);

    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      toast({
        title: "Only admins can remove users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        "http://localhost:5000/chat/remove-from-group",
        { chatId: selectedChat._id, usersList: [userToRemove._id] },
        { withCredentials: true }
      );

      userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(response.data.data);

      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
    

  };
  const handleAddUser = async (userToAdd) => {
    if (
      selectedChat.participants.find(
        (participant) => participant._id === userToAdd._id
      )
    ) {
      toast({
        title: "User already in group",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        "http://localhost:5000/chat/add-to-group",
        { chatId: selectedChat._id, usersList: [userToAdd._id] },
        { withCredentials: true }
      );

      setSelectedChat(response.data.data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };
  
  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }

    try {
      setRenameLoading(true);

      const response = await axios.put(
        "http://localhost:5000/chat/rename-group",
        { chatId: selectedChat._id, newChatName: groupChatName },
        { withCredentials: true }
      );

      setSelectedChat(response.data.data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setRenameLoading(false);
      setGroupChatName("");
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/auth/search?keyword=${query}`,
        { withCredentials: true }
      );
      setLoading(false);
      setSearchResult(response.data.data[0].data);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: error,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered="true">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily="Work sans"
            display={"flex"}
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w={"100%"} display="flex" flexWrap={"wrap"} pb={3}>
              {selectedChat.participants.map((participant) => (
                <UserBadgeItem
                  key={participant._id}
                  user={participant}
                  handleFunction={() => handleRemove(participant)}
                />
              ))}
            </Box>
            <FormControl display={"flex"}>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant={"solid"}
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add users to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UpdateGroupChatModal;
