import { hideContentById, hideContentByClass, displayContentById } from "./utility.js";


const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');

// close popupFrom
const closePopupForm = () => { hideContentByClass('mask') };

const closeMasks = document.getElementsByClassName('mask')
for (let n = 0; n < closeMasks.length; n++) {
    closeMasks[n].addEventListener('click', closePopupForm);
}
const closePopupBtns = document.getElementsByClassName('closePopupBtn');
for (let n = 0; n < closePopupBtns.length; n++) {
    closePopupBtns[n].addEventListener('click', closePopupForm);
}
document.getElementById('createChannelForm').addEventListener('click', (e) => {
    e.stopPropagation();
})
document.getElementById('currentChannelInfo').addEventListener('click', (e) => {
    e.stopPropagation();
})

const createBox = (boxType, givenClass, message) => {
    const box = document.createElement(boxType);
    box.className = givenClass;
    box.innerText = message;
    return box;
}

// get a chosen joined channels information from backend
const linkChannel = (id) => {
    document.getElementById(id).addEventListener('click', () => {
        let requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        };
        fetch(`http://localhost:5005/channel/${id}`, requestOptions).then(
            (response) => {
                if (response.status === 200) {
                    response.json().then((data) => {
                        // console.log(data);
                        const currentChannelName = document.getElementById('currentChannelName');
                        currentChannelName.innerText = data['name'];
                        currentChannelName.addEventListener('click', () => {
                            localStorage.setItem('channelId', id);
                            document.getElementById('currentChannelInfoTitle').children[0].innerText = `Channel: ${data['name']}`;
                            document.getElementById('currentChannelInfoName').children[1].innerText = data['name'];
                            document.getElementById('currentChannelInfoDescription').children[1].innerText = data['description'];
                            document.getElementById('currentChannelInfoCreatorAndTime').children[1].innerText = data['creator'] + ' ' + data['createdAt'];
                            displayContentById('currentChannelInfoMask');
                        })
                    });
                } else {
                    alert("Channel opening failed...");
                }
            }
        );

        fetch(`http://localhost:5005/message/${id}?start=0`, requestOptions).then(
            (response) => {
                if (response.status === 200) {
                    response.json().then((data) => {
                        console.log(data);
                        let messages = data['messages'];
                        const currentChannelChatBox = document.getElementById('currentChannelChatBox');
                        for (let n = 0; n < messages.length; n++) {
                            const chat = document.createElement('div');
                            chat.className = 'oneMessage';
                            // chat.setAttribute('meme', '');
                            chat.append(createBox('span', 'messageSender', messages[n]['sender']));
                            chat.append(createBox('span', 'messageTimeStamp', messages[n]['sentAt']));
                            chat.append(createBox('span', 'messageContent', messages[n]['message']));
                            chat.append(createBox('span', 'messageSenderImg', messages[n]['sender']));
                            // messageSenderImg "
                            currentChannelChatBox.insertBefore(chat, currentChannelChatBox.firstElementChild);

                        }

                        //     currentChannelName.innerText = data['name'];
                        // currentChannelName.addEventListener('click', () => {
                        //     // console.log(id);
                        //     localStorage.setItem('channelId', id);
                        //     document.getElementById('currentChannelInfoTitle').children[0].innerText = `Channel: ${data['name']}`;
                        //     document.getElementById('currentChannelInfoName').children[1].innerText = data['name'];
                        //     document.getElementById('currentChannelInfoDescription').children[1].innerText = data['description'];
                        //     document.getElementById('currentChannelInfoCreatorAndTime').children[1].innerText = data['creator'] + ' ' + data['createdAt'];
                        //     displayContentById('currentChannelInfoMask');

                    });
                } else {
                    alert("gettingMessage failed...");
                }
            }
        );
    });
};

// process of leaving a channel
document.getElementById('currentChannelInfoLeave').addEventListener('click', () => {
    const channelId = localStorage.getItem('channelId');
    console.log(channelId);
    fetch(`http://localhost:5005/channel/${channelId}/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                closePopupForm();
                openChannels(token);
            });
        } else {
            alert("leaveChannel failed...");
        }
    })
})

// process of joining a channel 
const joinChannel = (channel) => {
    document.getElementById(channel['id']).addEventListener('click', () => {
        document.getElementById('confirmPopupPrompt').innerText = `Do you want to join "${channel['name']}"?`;
        displayContentById('confirmPopupMask');
        localStorage.setItem('channelId', channel['id']);
    });
};

document.getElementById('confirmPopupBtn').addEventListener('click', () => {
    const channelId = localStorage.getItem('channelId');
    fetch(`http://localhost:5005/channel/${channelId}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                openChannels(token);
            });
        } else {
            alert("joinChannel failed...");
        }
    })


})


// show a list of channels
const itemExistInArray = (target, array) => {
    let flag = false;
    array.forEach(item => { if (item === target) { flag = true; } });
    return flag;
}
const showAllChannels = (data) => {
    const joinedChannels = document.getElementById('joinedChannels');
    const unjoinChannels = document.getElementById('unjoinChannels');
    while (joinedChannels.hasChildNodes()) { joinedChannels.removeChild(joinedChannels.childNodes[0]) };
    while (unjoinChannels.hasChildNodes()) { unjoinChannels.removeChild(unjoinChannels.childNodes[0]) };

    const joinChannelIDs = new Array();
    const unjoinChannelIDs = new Array();
    data['channels'].forEach((channel) => {
        const channelBar = document.createElement('li')
        const channelBox = document.createElement('span');
        channelBox.id = channel['id'];
        const image = document.createElement('img');
        channelBox.innerText = channel['name'];
        if (itemExistInArray(parseInt(userId), channel['members'])) {
            joinChannelIDs.push(channel['id']);
            (channel['private']) ? image.src = '../images/lock-fill.svg': image.src = '../images/people-fill.svg';
            channelBar.append(image);
            channelBar.append(channelBox)
            joinedChannels.append(channelBar);
        } else {
            unjoinChannelIDs.push(channel);
            image.src = '../images/door-closed-fill.svg';
            channelBar.append(image);
            channelBar.append(channelBox);
            unjoinChannels.append(channelBar);
        }

    })
    joinChannelIDs.map(linkChannel);
    unjoinChannelIDs.map(joinChannel);
}

export const openChannels = (token) => {
    fetch('http://localhost:5005/channel', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            hideContentById('login');
            hideContentById('register');
            displayContentById('channels');
            response.json().then((data) => {
                // console.log(data);
                showAllChannels(data);
            });
        } else {
            alert("openChannelList failed...");
        }
    })
}

// create a channel
let createFlag = true;
document.getElementById('tackleChannelBtn').addEventListener('click', () => { displayContentById('createChannelFormMask') });

// display createChannelFrom
// document.getElementById('createChannel').addEventListener('click', () => {
//     displayContentById('createChannelFormMask');
// });

// //mediate createChannelFrom in the window dynamically
// window.addEventListener('resize', () => {
//     let formWidth = parseInt(getComputedStyle(document.getElementById('createChannelForm')).width);
//     document.getElementById('createChannelForm').style.left = (document.documentElement.clientWidth - formWidth) / 2 + 'px';
//     let formwidth = parseInt(getComputedStyle(document.getElementById('currentChannelInfo')).width);
//     document.getElementById('currentChannelInfo').style.left = (document.documentElement.clientWidth - formWidth) / 2 + 'px';
// })


//
document.getElementById('createChannelBtn').addEventListener('click', () => {
    const name = document.getElementById('newChannelName').value;
    const description = document.getElementById('newChannelDescription').value;
    const privateFlag = document.getElementById('makePrivate').checked;

    const newChannelInfo = JSON.stringify({
        name,
        private: privateFlag,
        description,
    });

    // console.log(newChannelInfo);
    // console.log(token);

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: newChannelInfo,
    }

    fetch('http://localhost:5005/channel', requestOptions).then((response) => {
        if (response.status === 200) {
            closePopupForm();
            response.json().then((data) => {
                console.log(data);
                openChannels(token);
            });
        } else {
            alert("createChannels failed...");
        };
    });
});