import ChatBase from '@/components/chat/ChatBase'
import React from 'react'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params   // ✅ unwrap the promise
  console.log("the group id is:", id)

  return (
    <ChatBase
      roomId={id}
      roomName={`Chat Room ${id}`}
      userName="User"
    />
  )
}

export default Page
