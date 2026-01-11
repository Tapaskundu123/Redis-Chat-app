'use client'  
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createChatSchema, createChatSchemaType } from "@/schemas/groupChatValidation";
import { toast } from "sonner";
import axios from "axios";


interface receivedChatData{
        title: string,
        passcode: string,
        user_id: number // ✅ correct
}
const CreateChat = () => {
  const form = useForm<createChatSchemaType>({
    resolver: zodResolver(createChatSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (data: createChatSchemaType) => {
  
    try {
      
      const res= await axios.post("http://localhost:5000/api/chat-group",
    {
       title: data.title,
      passcode: data.passcode,
     },
    { withCredentials: true }
  )

     if(res.data){
        //  const resData:receivedChatData= await res.data;
        return toast.success('chat group made successfully',res.data)
     }

      reset();
    } catch (error:any) {
      toast.error('something went wrong',error?.message);
      return;
    }
  };

  return (
    <Dialog>
      {/* ✅ This is the recommended way */}
      <DialogTrigger asChild>
        <Button variant="outline">Create Group</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create your new chat</DialogTitle>
          <DialogDescription>
            Enter group title and passcode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter Title"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              {...register("passcode")}
              placeholder="Passcode"
            />
            {errors.passcode && (
              <p className="text-sm text-red-500 mt-1">
                {errors.passcode.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChat;