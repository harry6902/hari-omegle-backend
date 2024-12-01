"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
let userMap = new Map();
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on('connection', function (socket) {
    console.log('Namaste Anna!!');
    socket.on('message', (data) => {
        const info = JSON.parse(data.toString());
        if (info.type === 'join') {
            const roomName = info.payload.room;
            const name = info.payload.name;
            const id = info.payload.id;
            if (!userMap.get(roomName)) {
                userMap.set(roomName, [
                    [{
                            id,
                            name,
                            socket
                        }
                    ]
                ]);
            }
            else {
                userMap.forEach((value, key) => {
                    if (key === roomName) {
                        for (let i = value.length - 1; i >= 0; i--) {
                            if (value[i].length === 1) {
                                value[i].push({
                                    id,
                                    name,
                                    socket
                                });
                                let data = {
                                    type: "connected",
                                    payload: {
                                        socket: value[i][0].socket
                                    }
                                };
                                socket.send(JSON.stringify(data));
                                data = {
                                    type: "connected",
                                    payload: {
                                        socket: socket
                                    }
                                };
                                value[i][0].socket.send(JSON.stringify(data));
                                userMap.set(key, value);
                                break;
                            }
                            else if (value[i].length === 2) {
                                value.push([
                                    {
                                        id,
                                        name,
                                        socket
                                    }
                                ]);
                                break;
                            }
                        }
                    }
                });
            }
            // console.log(userMap.get("movies")?.length)
            // console.log(userMap.get("games")?.length)
            // userMap.forEach((value,key)=>{
            //     console.log(JSON.stringify(value));
            // })
        }
        else if (info.type === 'message') {
            const info = JSON.parse(data.toString());
            userMap.forEach((value, key) => {
                for (let i = 0; i < value.length; i++) {
                    if (value[i][0].id === info.payload.id) {
                        value[i][1].socket.send(JSON.stringify(info));
                        break;
                    }
                    else if (value[i][1].id === info.payload.id) {
                        value[i][0].socket.send(JSON.stringify(info));
                        break;
                    }
                }
            });
        }
        else if (info.type === 'disconnect') {
            userMap.forEach((value, key) => {
                for (let i = 0; i < value.length; i++) {
                    if (value[i][0].id === info.payload.id) {
                        value[i][1].socket.send(JSON.stringify(info));
                        value.filter((item) => {
                            return item !== value[i];
                        });
                        userMap.set(key, value);
                        break;
                    }
                    else if (value[i][1].id === info.payload.id) {
                        value[i][0].socket.send(JSON.stringify(info));
                        value.filter((item) => {
                            return item !== value[i];
                        });
                        userMap.set(key, value);
                        break;
                    }
                }
            });
        }
    });
});
