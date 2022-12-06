import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "../profileModal.js/ProfileModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatLoading from "../chatLoading/ChatLoading";
import UserListItem from "../userAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import Notify from "../notify/Notify";

function SideDrawer() {
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingchat, setLoadingChat] = useState();

  const logoutHandler = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true,
      });

      localStorage.removeItem("userInfo");

      toast({
        title: response.data.message,
        status: response.data.status === 200 ? "success" : "error",
        duration: 5000,
        isClosable: true,
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Error occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const accessChat = async (user) => {
    try {
      setLoadingChat(true);
      const response = await axios.post(
        "http://localhost:5000/chat/access-chat",
        { user },
        { withCredentials: true }
      );

      if (!chats.find((chat) => chat._id === response.data.data._id)) {
        setChats([response.data.data, ...chats]);
        setSelectedChat(response.data.data);
      } else {
        const result = chats.find(({ _id }) => _id === response.data.data._id);
        setSelectedChat(result);
      }

      setLoadingChat(false);
      setSearchResult([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/auth/search?keyword=${search}`,
        { withCredentials: true }
      );

      setLoading(false);
      setSearchResult(response.data.data[0].data);
      setSearch("");
    } catch (error) {
      toast({
        title: "Error Occured",
        description: error,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems="center"
        bg={"white"}
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth={"5px"}
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant={"ghost"} onClick={onOpen}>
            <i class="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize={"2xl"} fontFamily="Work sans">
          Prolix
        </Text>
        <div>
          <Menu>
            <MenuButton p={"1"}>
              <Notify count={notification.length}/>
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length ? "No new messages" :
              (notification.length && notification.map((noti) => (
                <MenuItem key={noti._id} onClick={() => {
                  setSelectedChat(noti.chat);
                  setNotification(notification.filter((n) => n !== noti));
                }} >
                  {noti.chat.isGroupChat
                    ? `New Message in ${noti.chat.chatName}`
                    : `New Message from ${getSender(
                        user,
                        noti.chat.participants
                      )}`}
                </MenuItem>
              )))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size={"sm"}
                cursor="pointer"
                name={user.name}
                src={user.profilePic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display={"flex"} pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingchat && <Spinner ml={"auto"} display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
