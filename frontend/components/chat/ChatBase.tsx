'use client'

import { useEffect, useMemo } from "react"
import { connectSocket } from "@/lib/socket-config"
import { v4 as uuidv4 } from 'uuid'
const ChatBase = () => {// render only once 

    let socket= useMemo(()=>{
       
        const socket= connectSocket();
        return socket.connect();
    },[])

    useEffect(()=>{
        socket.on('message',(data:any)=>{
            console.log('The secret message is ',data)
        })
        return()=>{
          socket.close()
        }
    },[])
    const handleMessage=()=>{
        socket.emit('message',{name:'Tapas',id:uuidv4(),message:'secret message'})
    }
  return (
    <div>
        <h1>HI chat-app</h1>\
     <button onClick={handleMessage}>send message</button>   
     </div>
  )
}

export default ChatBase