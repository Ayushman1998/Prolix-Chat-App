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
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";

function Signup() {
  const { setUser } = ChatState();

  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const [formsubmitted, setFormSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
  });

  const [formDataErrors, setFormDataErrors] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
  });

  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const postDetails = (profilePic) => {
    setLoading(true);
    if (
      profilePic &&
      (profilePic.type === "image/jpeg" || profilePic.type === "image/png")
    ) {
      const data = new FormData();
      data.append("file", profilePic);
      data.append("upload_preset", "prolix");
      data.append("cloud_name", "drz8t9er2");

      axios
        .post("https://api.cloudinary.com/v1_1/drz8t9er2/image/upload", data)
        .then((response) => {
          setFormData({ ...formData, profilePic: response.data.url });
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        description: "Image selected is not of type jpeg/png",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const validate = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    const nameRegex = /^[a-zA-Z0-9!@#$%^&*_+\-"'<>,.?;:|]{2,32}$/i;
    const emailRegex =
      /^[a-zA-Z0-9]{1,15}[.]*[a-zA-Z0-9]{1,15}[@][a-zA-Z0-9]{2,8}[.][a-zA-Z0-9]{1,8}[.]*[a-zA-Z0-9]{1,8}$/i;
    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*_+\-"'<>,.?;:|`]{8,16}$/;

    let { name, email, username, password, confirmPassword } = formData;

    // validation for name
    if (name === "") {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        name: "Required",
      }));
    } else if (!nameRegex.test(name)) {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        name: "Please enter a valid name",
      }));
    } else {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        name: "",
      }));
    }

    // validation for username
    if (username === "") {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        username: "Required",
      }));
    } else if (!nameRegex.test(username)) {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        username: "Please enter a valid username",
      }));
    } else {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        username: "",
      }));
    }

    // validation for email
    if (email === "") {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        email: "Required",
      }));
    } else if (!emailRegex.test(email)) {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        email: "Please enter a valid email",
      }));
    } else {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        email: "",
      }));
    }

    // validation for password
    if (password === "") {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        password: "Required",
      }));
    } else if (!passwordRegex.test(password)) {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        password: "Please enter a strong password",
      }));
    } else {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        password: "",
      }));
    }

    // validation for confirm password
    if (confirmPassword === "") {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        confirmPassword: "Required",
      }));
    } else if (confirmPassword !== password) {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        confirmPassword: "Password does not match",
      }));
    } else {
      setFormDataErrors((formDataErrors) => ({
        ...formDataErrors,
        confirmPassword: "",
      }));
    }

    if (
      !formDataErrors.name &&
      !formDataErrors.username &&
      !formDataErrors.email &&
      !formDataErrors.password &&
      !formDataErrors.confirmPassword
    ) {
      try {
        // const config = {
        //     header: {
        //         "Content-type": "application/json"
        //     }
        // };

        let response = await axios.post(
          "http://localhost:5000/auth/register",
          formData,
          { withCredentials: true }
        );

        toast({
          title: response.data.message,
          description: `We've created your account for ${response.data.data.email}.`,
          status: response.data.status === 200 ? "success" : "error",
          duration: 5000,
          isClosable: true,
        });

        let loginDetail = {loginId: formData.email, password: formData.password}

        try {
          response = await axios.post(
            "http://localhost:5000/auth/login",
            loginDetail,
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

        setFormData({
          ...formData,
          name: "",
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
          profilePic: "",
        });

        setFormSubmitted(false);
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
    }
  };

  return (
    <VStack>
      {/* Name */}
      <FormControl isInvalid={formDataErrors.name} isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          placeholder="Enter name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {formsubmitted && !formDataErrors.name ? (
          <FormHelperText textAlign={"left"} color="green.400">
            Looks good!
          </FormHelperText>
        ) : (
          <FormErrorMessage>{formDataErrors.name}</FormErrorMessage>
        )}
      </FormControl>

      {/* Username */}
      <FormControl isInvalid={formDataErrors.username} isRequired>
        <FormLabel>Username</FormLabel>
        <Input
          type="text"
          placeholder="Enter username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />
        {formsubmitted && !formDataErrors.username ? (
          <FormHelperText textAlign={"left"} color="green.400">
            Looks good!
          </FormHelperText>
        ) : (
          <FormErrorMessage>{formDataErrors.name}</FormErrorMessage>
        )}
      </FormControl>

      {/* Email */}
      <FormControl isInvalid={formDataErrors.email} isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {formsubmitted && !formDataErrors.email ? (
          <FormHelperText textAlign={"left"} color="green.400">
            Looks good!
          </FormHelperText>
        ) : (
          <FormErrorMessage>{formDataErrors.email}</FormErrorMessage>
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

      {/* Confirm Password */}
      <FormControl isInvalid={formDataErrors.confirmPassword} isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
          />
          <InputRightElement width={"4.5rem"}>
            <Button h={"1.75rem"} size="sm" onClick={() => setShow(!show)}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        {formsubmitted && !formDataErrors.confirmPassword ? (
          <FormHelperText textAlign={"left"} color="green.400">
            Looks good!
          </FormHelperText>
        ) : (
          <FormErrorMessage>{formDataErrors.confirmPassword}</FormErrorMessage>
        )}
      </FormControl>

      {/* Picture upload */}
      <FormControl>
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      {/* Submit */}
      <Button
        type="submit"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={(e) => validate(e)}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default Signup;
