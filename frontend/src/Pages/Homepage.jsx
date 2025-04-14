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
  import { useEffect } from "react";
  import { useNavigate } from "react-router-dom"; // Change from 'useHistory' to 'useNavigate'
  import Login from "../components/Authentication/Login";
  import Signup from "../components/Authentication/Signup";
  
  function Homepage() {
    const navigate = useNavigate(); // Update to useNavigate
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("userInfo"));
  
      if (user) navigate("/chats"); // Update to navigate instead of history.push
    }, [navigate]);
  
    return (
      <Container maxW="xl" centerContent>
        <Box
          display="flex"
          justifyContent="center"
          p={3}
          bg="white"
          w="100%"
          mt="20px"
          mb="10px" // Adjusted spacing
          borderRadius="lg"
          borderWidth="1px"
        >
          <Text fontSize="4xl" fontFamily="Work sans">
            Talk-A-Tive
          </Text>
        </Box>
        <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
          <Tabs isFitted variant="soft-rounded">
            <TabList mb="0px">
              <Tab>Login</Tab>
              <Tab>Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={2}>
                <Login />
              </TabPanel>
              <TabPanel p={2}>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    );
  }
  
  export default Homepage;
  