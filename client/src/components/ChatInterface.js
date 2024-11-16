import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  Badge,
  Stack,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Phone as PhoneIcon,
  Videocam as VideocamIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const MessageBubble = styled(Paper)(({ theme, sent }) => ({
  padding: theme.spacing(1.5),
  maxWidth: '70%',
  borderRadius: theme.spacing(2),
  backgroundColor: sent ? theme.palette.primary.main : theme.palette.grey[100],
  color: sent ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderBottomRightRadius: sent ? 0 : theme.spacing(2),
  borderBottomLeftRadius: sent ? theme.spacing(2) : 0,
}));

const contacts = [
  { 
    id: 1, 
    name: 'HOD - Dr. Smitha', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Please submit the semester report',
    lastSeen: '2 min ago',
    online: true
  },
  { 
    id: 2, 
    name: 'Coordinator - Prof. Ananthu', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Meeting scheduled for tomorrow',
    lastSeen: '5 min ago',
    online: true
  },
  { 
    id: 3, 
    name: 'Warden - Mr. Anil', 
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Hostel inspection at 4 PM',
    lastSeen: '1 hour ago',
    online: false
  },
];

const sampleChats = {
  1: [
    { text: 'Good morning ', sender: 'user', time: '9:30 AM' },
    { text: 'Hello! How can I help you today?', sender: 'contact', time: '9:31 AM' },
    { text: 'I wanted to discuss the semester report', sender: 'user', time: '9:32 AM' },
    { text: 'Sure, please submit it by Friday', sender: 'contact', time: '9:33 AM' },
    { text: 'Will do, thank you!', sender: 'user', time: '9:34 AM' },
  ],
  2: [
    { text: 'Meeting tomorrow at 10 AM?', sender: 'contact', time: '2:20 PM' },
    { text: 'Yes, I will be there', sender: 'user', time: '2:21 PM' },
  ],
  3: [
    { text: 'Hostel inspection scheduled', sender: 'contact', time: '1:15 PM' },
    { text: 'Noted, I will inform the students', sender: 'user', time: '1:16 PM' },
  ]
};

const ChatInterface = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(sampleChats);
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showContacts, setShowContacts] = useState(true);

  useEffect(() => {
    setShowContacts(!isMobile || !selectedContact);
  }, [isMobile, selectedContact]);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    if (isMobile) {
      setShowContacts(false);
    }
  };

  const handleMessageSend = () => {
    if (message.trim() && selectedContact) {
      const newMessage = {
        text: message,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory({
        ...chatHistory,
        [selectedContact.id]: [
          ...(chatHistory[selectedContact.id] || []),
          newMessage
        ],
      });
      setMessage('');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ContactsList = () => (
    <Paper sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'background.default' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredContacts.map((contact) => (
          <ListItem
            key={contact.id}
            button
            selected={selectedContact?.id === contact.id}
            onClick={() => handleContactSelect(contact)}
          >
            <ListItemAvatar>
              {contact.online ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar src={contact.avatar} alt={contact.name} />
                </StyledBadge>
              ) : (
                <Avatar src={contact.avatar} alt={contact.name} />
              )}
            </ListItemAvatar>
            <ListItemText
              primary={contact.name}
              secondary={contact.lastMessage}
              secondaryTypographyProps={{
                noWrap: true,
                sx: { maxWidth: '180px' }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {contact.lastSeen}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const ChatArea = () => (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton onClick={() => setShowContacts(true)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            invisible={!selectedContact.online}
          >
            <Avatar src={selectedContact.avatar} alt={selectedContact.name} />
          </StyledBadge>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1">{selectedContact.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedContact.online ? 'Online' : selectedContact.lastSeen}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton>
            <PhoneIcon />
          </IconButton>
          <IconButton>
            <VideocamIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Stack>
      </Paper>
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {chatHistory[selectedContact.id]?.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <MessageBubble sent={msg.sender === 'user'} elevation={0}>
              <Typography variant="body2">{msg.text}</Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                gap: 0.5,
                mt: 0.5
              }}>
                <Typography variant="caption" color={msg.sender === 'user' ? 'primary.light' : 'text.secondary'}>
                  {msg.time}
                </Typography>
                {msg.sender === 'user' && (
                  <CheckIcon sx={{ width: 16, height: 16, color: 'primary.light' }} />
                )}
              </Box>
            </MessageBubble>
          </Box>
        ))}
      </Box>
      <Paper sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleMessageSend();
              }
            }}
          />
          <IconButton
            color="primary"
            onClick={handleMessageSend}
            disabled={!message.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'grey.100' }}>
      {(showContacts || !isMobile) && (
        <Box sx={{ width: isMobile ? '100%' : 320, height: '100%' }}>
          <ContactsList />
        </Box>
      )}
      {selectedContact && (!showContacts || !isMobile) && (
        <Box sx={{ flexGrow: 1, height: '100%' }}>
          <ChatArea />
        </Box>
      )}
    </Box>
  );
};

export default ChatInterface;
