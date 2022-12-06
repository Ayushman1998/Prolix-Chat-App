import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../context/ChatProvider";

function Login() {
  const { setUser } = ChatState();

  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const [formsubmitted, setFormSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const [formDataErrors, setFormDataErrors] = useState({
    loginId: "",
    password: "",
  });

  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const validate = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    // console.log("Validate");

    const loginIdRegex = /^[a-zA-Z0-9!@#$%^&*_+\-"'<>,.?;:|]{2,50}$/i;

    let { loginId } = formData;

    // validation for loginId
    if (loginId === "") {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        loginId: "Required",
      }));
    } else if (!loginIdRegex.test(loginId)) {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        loginId: "Please enter a valid login id",
      }));
    } else {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        loginId: "",
      }));
    }

    if (!formDataErrors.loginId) {
      try {
        // const config = {
        //   header: {
        //     "Content-type": "application/json",
        //   },
        // };

        const response = await axios.post(
          "http://localhost:5000/auth/login",
          formData,
          { withCredentials: true }
        );

        toast({
          title: response.data.message,
          description: response.data.data
            ? `Logged in as ${response.data.data.email}`
            : "",
          status: response.data.status === 200 ? "success" : "error",
          duration: 5000,
          isClosable: true,
        });

        setFormData({
          ...formData,
          loginId: "",
          password: "",
        });

        setFormSubmitted(false);
        setLoading(false);

        if (response.data.data) {
          localStorage.setItem("userInfo", JSON.stringify(response.data.data));
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          setUser(userInfo);
        }

        navigate("/chat");
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
    }
  };

  return (
    <VStack>
      {/* LoginID */}
      <FormControl isInvalid={formDataErrors.loginId} isRequired>
        <FormLabel>Login ID</FormLabel>
        <Input
          type="text"
          placeholder="Enter username or email"
          value={formData.loginId}
          onChange={(e) =>
            setFormData({ ...formData, loginId: e.target.value })
          }
        />
        {formsubmitted && !formDataErrors.loginId ? (
          <FormHelperText textAlign={"left"} color="green.400">
            Looks good!
          </FormHelperText>
        ) : (
          <FormErrorMessage>{formDataErrors.loginId}</FormErrorMessage>
        )}
      </FormControl>

      {/* Password */}
      <FormControl isInvalid={formDataErrors.password} isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <InputRightElement width={"4.5rem"}>
            <Button h={"1.75rem"} size="sm" onClick={() => setShow(!show)}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>

        {formsubmitted && !formDataErrors.password ? (
          <FormHelperText textAlign={"left"} color="green.400">
            Looks good!
          </FormHelperText>
        ) : (
          <FormErrorMessage>{formDataErrors.password}</FormErrorMessage>
        )}
      </FormControl>

      {/* Submit */}
      <Button
        type="submit"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={(e) => validate(e)}
        isLoading={loading}
      >
        Login
      </Button>
    </VStack>
  );
}

export default Login;
