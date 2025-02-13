import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useParams } from 'react-router-dom';
import peer from '../service/peer';
const Room = () => {
    const socket = useSocket();
    const { roomId } = useParams();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const myVideoRef = useRef(null);
    const [remoteStream, setRemoteStream] = useState()

    const handleCallUser = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const offer = await peer.getOffer();
            socket.emit("user:call", { to: remoteSocketId, offer })
            setMyStream(stream);

            // Assign the stream to the video element
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        try {
            setRemoteSocketId(from);

            // Get user media stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMyStream(stream);

            // Assign stream to video element
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
            }

            console.log('Incoming call from:', from, 'Offer:', offer);

            // Generate answer for the offer
            const ans = await peer.getAnswer(offer);

            // Emit the answer back to the caller
            socket.emit('call:accepted', { to: from, ans });

        } catch (error) {
            console.error('Error handling incoming call:', error);
        }
    }, [socket]);


    const handleUserJoined = useCallback(({ email, id }) => {
        console.log('User joined the room:', { email, id });
        setRemoteSocketId(id);
    }, []);

    const handleCallAccepted = useCallback(async ({ from, ans }) => {
        peer.setLocalDescription(ans)
        console.log('Call Accepted!');

        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream)
        }
    }, [])

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on('incoming:call', handleIncomingCall)
        socket.on('call:accepted', handleCallAccepted)


        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted)
        };
    }, [socket, handleUserJoined, handleCallAccepted, handleIncomingCall]);

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams
            setRemoteStream(remoteStream)
        })
    }, [])

    useEffect(() => {
        // Ensure video updates when myStream changes
        if (myStream && myVideoRef.current) {
            myVideoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    return (
        <div>
            <h1>Room Page {roomId}</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>

            {remoteSocketId && <button onClick={handleCallUser}>Call</button>}

            {myStream && (
                <video ref={myVideoRef} autoPlay playsInline width="300" height="200" />
            )}
            {remoteStream && (
                <video ref={remoteStream} autoPlay playsInline width="300" height="200" />
            )}
        </div>
    );
};

export default Room;
