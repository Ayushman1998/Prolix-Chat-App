import { Avatar, Tooltip } from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../config/ChatLogics";
import { ChatState } from "../../context/ChatProvider";

function ScrollableChat({ messages }) {
  const { user } = ChatState();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const useIsInViewport = (ref) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    const observer = useMemo(
      () =>
        new IntersectionObserver(([entry]) =>
          setIsIntersecting(entry.isIntersecting)
        ),
      []
    );

    useEffect(() => {
      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }, [ref, observer]);

    return isIntersecting;
  };

  const isInViewport = useIsInViewport(messagesEndRef);

  useEffect(() => {
      scrollToBottom();
  }, []);

  useEffect(() => {
    if(isInViewport) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <>
      {/* // <ScrollableFeed> */}
      {messages &&
        messages.map((message, index) => (
          <div style={{ display: "flex" }} key={message._id}>
            {(isSameSender(messages, message, index, user._id) ||
              isLastMessage(messages, index, user._id)) && (
              <Tooltip
                label={message.sender.name}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  mt={"7px"}
                  mr={1}
                  size="sm"
                  cursor={"pointer"}
                  name={message.sender.name}
                  src={message.sender.profilePic}
                />
              </Tooltip>
            )}

            <span
              style={{
                backgroundColor: `${
                  message.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                marginLeft: isSameSenderMargin(
                  messages,
                  message,
                  index,
                  user._id
                ),
                marginTop: isSameUser(messages, message, index, user._id)
                  ? 3
                  : 10,
              }}
            >
              {message.content}
            </span>
          </div>
        ))}

      <div ref={messagesEndRef} />
      {/* </ScrollableFeed> */}
    </>
  );
}

export default ScrollableChat;
