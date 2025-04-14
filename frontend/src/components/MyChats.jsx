import { AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, Flex} from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button, IconButton, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [isLoading, setIsLoading] = useState(false);

  
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      bg="white"
      width={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="md"
      position="relative"
      overflow="hidden"
    >
      {/* Header Section */}
      <Flex
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Text fontWeight="bold" color="teal.600">
          My Chats
        </Text>
        
        <Menu>
          <MenuButton 
            as={IconButton}
            icon={<ChevronDownIcon />}
            variant="ghost"
            size="sm"
            aria-label="Chat options"
          />
          <MenuList>
            <GroupChatModal>
              <MenuItem icon={<AddIcon />} fontSize="sm">
                New Group Chat
              </MenuItem>
            </GroupChatModal>
          </MenuList>
        </Menu>
      </Flex>

      {/* Chat List Section */}
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bg="gray.50"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="hidden"
        position="relative"
      >
        {isLoading ? (
          <ChatLoading />
        ) : chats?.length > 0 ? (
          <Stack 
            spacing={2} 
            overflowY="auto" 
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'teal',
                borderRadius: '24px',
              },
            }}
          >
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "teal.500" : "white"}
                color={selectedChat === chat ? "white" : "gray.800"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                  bg: selectedChat === chat ? "teal.600" : "gray.100"
                }}
                borderWidth="1px"
                borderColor={selectedChat === chat ? "teal.600" : "gray.200"}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontWeight="semibold">
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs" color={selectedChat === chat ? "white" : "gray.500"}>
                      {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </Flex>
                
                {chat.latestMessage && (
                  <Text 
                    fontSize="sm" 
                    mt={1}
                    noOfLines={1}
                    color={selectedChat === chat ? "white" : "gray.600"}
                  >
                    <b>{chat.latestMessage.sender.name}: </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Flex 
            height="100%" 
            alignItems="center" 
            justifyContent="center"
            flexDirection="column"
            textAlign="center"
            color="gray.500"
          >
            <Text fontSize="lg" mb={2}>No chats yet</Text>
            <GroupChatModal>
              <Button 
                colorScheme="teal" 
                size="sm" 
                leftIcon={<AddIcon />}
                variant="outline"
              >
                Start a new chat
              </Button>
            </GroupChatModal>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;