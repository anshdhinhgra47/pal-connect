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
    audio: true
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

const muteButton = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmutedButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const newBtn = `
    <i class="fas fa-microphone" style="font-size: 24px;"></i>
    <span>Mute</span>
    `;

    document.querySelector('.mute_btn').innerHTML = newBtn;
}

const setUnmutedButton = () => {
    const newBtn = `
    <i class="unmute fas fa-microphone-slash" style="font-size: 24px; color: #CC3B33;"></i>
    <span>Unmute</span>
    `;

    document.querySelector('.mute_btn').innerHTML = newBtn;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {
    const newVideo = `
    <i class="stop fas fa-video-slash" style="font-size: 24px; color: #CC3B33;"></i>
    <span>Play Video</span>
    `;

    document.querySelector('.video_btn').innerHTML = newVideo;
}

const setStopVideo = () => {
    const newVideo = `
    <i class="fas fa-video" style="font-size: 24px;"></i>
    <span>Stop Video</span>
    `;

    document.querySelector('.video_btn').innerHTML = newVideo;
}