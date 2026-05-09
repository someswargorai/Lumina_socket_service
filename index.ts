import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const { token, userId } = socket.handshake.auth;
    const roomToJoin = userId || token;
    if (roomToJoin) {
        socket.join(roomToJoin);
    }

    socket.on('joinRoom', (roomId) => {
        // console.log(userId, 'joined room', roomId);
        socket.join(roomId);
    });

    socket.on('sendMessage', (data) => {
        console.log('message:', data);
        socket.broadcast.to(data.senderId).emit('notification_message', data);
        socket.broadcast.to(data.roomId).emit('message', data);
    });

    socket.on("call", (data) => {
        console.log("call", data);
        socket.broadcast.to(data.roomId).emit('call', data);
    })

    socket.on("video_call", (data) => {
        console.log("video_call", data);
        socket.broadcast.to(data.receiverId).emit('video_call', data);
    })

    socket.on("video", (data) => {
        console.log("video", data);
        socket.broadcast.to(data.roomId).emit('video', data);
    })

    socket.on("leaveRoom", (data) => {
        console.log("leaveRoom", data);
        socket.leave(data.roomId);
        socket.broadcast.to(data.roomId).emit('call_end', data);
    })



    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});


server.listen(8003, () => {
    console.log('Socket service is running on port 8003');
});