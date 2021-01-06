const socket  = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.style.height = '300px';
myVideo.style.width = '400px';
myVideo.style.objectFit = 'cover';

myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
});


let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        video.style.height = '300px';
        video.style.width = '400px';
        video.style.objectFit = 'cover';
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });

    let text = $('input');

    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('');
        }
    });

    socket.on('createMessage', message => {
        $('ul').append(`<li class="message" style="color: white;">
                            <b>USER: </b>
                            ${message}
                            </li>
                            <br/>`);
        scrollToBottom();
    });
    
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})


const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    video.style.height = '300px';
    video.style.width = '400px';
    video.style.objectFit = 'cover';
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let scroll = $('.main_chat_window');
    scroll.scrollTop(scroll.prop("scrollHeight"));
}

