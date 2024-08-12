'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Customer support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const messagesEndRef = useRef(null)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;  // Don't send empty messages and check if already loading
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFeedbackSubmit = () => {
    // Handle the feedback submission (e.g., send it to a server or save it locally)
    console.log('Feedback submitted:', feedback)
    setFeedback('')
    setFeedbackSubmitted(true)
  }

  const toggleFeedbackVisibility = () => {
    setFeedbackVisible((prev) => !prev)
    if (feedbackSubmitted) {
      setFeedbackSubmitted(false) // Reset feedback submitted status
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="black" // Background color for the page
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        borderRadius={8}
        border="1px solid #ccc"
        boxShadow="0 4px 4px rgba(0, 0, 0, 0.1)"
        bgcolor="white"
        position="relative" 
        display="flex"
        flexDirection="column"
      >
        <Button
          variant="contained"
          color="primary"
          onClick={toggleFeedbackVisibility}
          disabled={isLoading}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'black',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            minWidth: 'auto',
            p: 0,
            fontSize: '20px',
          }}
        >
          X
        </Button>
        <Box
          bgcolor="#1976d2" // Darker blue for header
          color="white"
          p={2} // Increased padding for better spacing
          borderRadius="8px 8px 0 0"
          fontWeight="bold"
          textAlign="center"
        >
          Support Chat
        </Box>
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          pr={1} // Padding to avoid text overlapping with scrollbar
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'lightblue' // Light blue for assistant messages
                    : '#c5e1a5' // Light green for user messages
                }
                color="black"
                borderRadius={20}
                p={2}
                maxWidth="75%"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems="center" p={2}>
          <TextField
            label="Message"
            fullWidth
            variant="outlined"
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{ bgcolor: '#f5f5f5' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
        {feedbackVisible && (
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Feedback
            </Typography>
            <TextField
              label="Your feedback"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{ bgcolor: '#f5f5f5' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleFeedbackSubmit}
              sx={{ mt: 2 }}
            >
              Submit Feedback
            </Button>
            {feedbackSubmitted && (
              <Typography variant="body2" color="green" mt={1}>
                Thank you for your feedback!
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  )
}
