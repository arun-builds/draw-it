
import Chat from "@/components/Chat"
import Players from "@/components/Players"
import Whiteboard from "@/components/Whiteboard"

export const Play = () => {
    return (
        <div className=" h-screen w-full flex justify-between items-center p-2 bg-blue-500">
            <div className="h-full flex items-center"><Players /></div>
            <div><Whiteboard /></div>
            <div className="h-full flex items-center"><Chat /></div>
        </div>
    )
}