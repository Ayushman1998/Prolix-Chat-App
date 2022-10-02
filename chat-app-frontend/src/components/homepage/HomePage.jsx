import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Lottie from "lottie-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../login/Login";
import Signup from "../signup/Signup";
import "./HomePage.css";
import chatAnimation from "../../animation/chatAnimation2.json";

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo) {
      navigate("/chat");
    }
  }, []);

  return (
    <>
      <div className="mainParent">
        <div className="HomePage">
          <Container maxW="xl" centerContent>
            <Box
              d="flex"
              justifyContent="center"
              p={3}
              bg={"white"}
              w="100%"
              m="40px 0 15px 0"
              borderRadius="lg"
              borderWidth="1px"
            >
              <Text fontSize="4xl" fontFamily="Work sans" color="black">
                Prolix
              </Text>
            </Box>
            <Box
              bg={"white"}
              w="100%"
              p={4}
              borderRadius="lg"
              borderWidth={"1px"}
            >
              <Tabs variant="soft-rounded">
                <TabList>
                  <Tab width="50%">Login</Tab>
                  <Tab width="50%">Sign Up</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>{<Login />}</TabPanel>
                  <TabPanel>{<Signup />}</TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Container>
        </div>
        <div className="chatAnimation">
          <Lottie animationData={chatAnimation}></Lottie>
        </div>
      </div>
    </>
  );
}

export default HomePage;
