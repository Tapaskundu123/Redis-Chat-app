import ChatBase from '@/components/chat/ChatBase'
import React from 'react'

const page = ({params}:{params:{id:string}}) => {

    console.log("the group id is :",params.id)
  return (
    <div>
        <ChatBase/>
    </div>
  )
}

export default page