import ChatBase from '@/components/chat/ChatBase'
import React from 'react'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params   // ✅ unwrap the promise
  console.log("the group id is:", id)

  return (
    <div>
      <ChatBase />
    </div>
  )
}

export default Page