import { BACKEND_PORT } from './config.js';
import { allUsersInfo, updateInfoPopup } from "./users.js";
import { displayContentById } from "./utility.js";
import { fileToDataUrl } from './helpers.js';


// const userId = localStorage.getItem('userId');

const createBox = (boxType, givenClass, message) => {
    const box = document.createElement(boxType);
    box.className = givenClass;
    box.innerText = message;
    return box;
}

export const cleanAllChildren = (elementId) => {
    const element = document.getElementById(elementId);
    while (element.hasChildNodes()) { element.removeChild(element.lastChild); };
};


export const timeStampSwitch = (time) => {
    let re = time.match(/^(.*)T(\d*:\d*):/);
    return re;

}

const photos = new Array();
let currentPhotoId = 0;

//refresh current channel content
export const refreshCurrentChannelMsg = (id, token, allUsersInfo) => {
    let requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    };
    fetch(`http://localhost:${BACKEND_PORT}/message/${id}?start=0`, requestOptions).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                // console.log(data);
                let messages = data['messages'];

                cleanAllChildren('currentChannelChatBox');
                cleanAllChildren('pinPopup');

                photos.splice(0, photos.length);
                let currentPhotoId = 0;

                for (let n = 0; n < messages.length; n++) {
                    const chat = document.createElement('div');
                    chat.id = messages[n]['id'];
                    chat.className = 'oneMessage';
                    // console.log(messages[n]['sender']);
                    // console.log(allUsersInfo);

                    // append the sender&timestamp box
                    const senderName = allUsersInfo[messages[n]['sender']]['name'];
                    const senderBox = createBox('span', '', `${senderName}`);
                    const senderAndTime = createBox('span', 'messageSender', '');

                    const timeBox = createBox('span', 'messageTimeStamp', '');
                    if (messages[n]['edited'] === false) {
                        timeBox.innerText = ' ' + timeStampSwitch(messages[n]['sentAt'])[1] + ' ' + timeStampSwitch(messages[n]['sentAt'])[2];
                    } else {
                        timeBox.innerText = ' ' + timeStampSwitch(messages[n]['editedAt'])[1] + ' ' + timeStampSwitch(messages[n]['editedAt'])[2] + ' (edited)';
                    };
                    timeBox.style.fontSize = '0.8em';
                    timeBox.style.color = '#3D3F40';

                    senderAndTime.append(senderBox);
                    senderAndTime.append(timeBox);

                    const messageEditBtn = document.getElementById("messageEditBtn");
                    let newMsgEditBtn = messageEditBtn.cloneNode(true);
                    // console.log('newMsgEditBtn', newMsgEditBtn);
                    newMsgEditBtn.style.display = 'block';
                    newMsgEditBtn.style.float = 'right';
                    senderAndTime.append(newMsgEditBtn);
                    chat.append(senderAndTime);


                    // click on a users' name on a given message, their profile screen should be displayed.
                    senderBox.addEventListener('mouseover', () => {
                        senderBox.style.cursor = 'pointer';
                        senderBox.style.textDecoration = 'underline';
                    })
                    senderBox.addEventListener('mouseout', () => {
                        senderBox.style.textDecoration = '';
                    })

                    senderBox.addEventListener('click', () => {
                        fetch(`http://localhost:${BACKEND_PORT}/user/${messages[n]['sender']}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token,
                            }
                        }).then((response) => {
                            if (response.status === 200) {
                                response.json().then((data) => {
                                    document.getElementById("oneUserProfileName").innerText = data['name'];
                                    document.getElementById("oneUserBio").innerText = data['bio'];
                                    document.getElementById("oneUserEmail").innerText = data['email'];
                                    document.getElementById("oneUserPhoto").src = data['image'];
                                    (data['image'] !== null && data['image'].match(/^data:image\/.+/)) ? document.getElementById("oneUserPhoto").src = data['image']:
                                        document.getElementById("oneUserPhoto").src = '../images/person-lines-fill.svg';
                                    document.getElementById("oneUserProfileTitle").children[0].innerText = `${data['name']}'s profile`;
                                    displayContentById("oneUserProfileMask");
                                });
                            };
                        })
                    });


                    // edit a message
                    const editMessage = newMsgEditBtn.children[1].children[0];
                    // if (messages[n]['image'].match(/^data:image\/.+/) === null &&
                    if (messages[n]['image'] === null &&
                        parseInt(messages[n]['sender']) === parseInt(localStorage.getItem('userId'))) {
                        editMessage.addEventListener('click', () => {
                            const seletedMsg = document.getElementById(messages[n]['id']);
                            console.log('edit', messages[n]['id']);
                            const editWindow = document.createElement('span');
                            editWindow.innerText = seletedMsg.children[1].innerText;
                            editWindow.contentEditable = true;
                            editWindow.className = 'messageContent';
                            const formerMsg = seletedMsg.children[1];
                            seletedMsg.replaceChild(editWindow, formerMsg);

                            const cancelBtn = document.createElement('button');
                            cancelBtn.className = 'btn btn-danger';
                            cancelBtn.innerText = 'Cancel';
                            cancelBtn.style.gridColumn = '2/3';
                            cancelBtn.style.marginTop = '0.5em';
                            cancelBtn.style.fontSize = '0.7em';
                            seletedMsg.append(cancelBtn);
                            const saveBtn = document.createElement('button');
                            saveBtn.className = 'btn btn-primary';
                            saveBtn.innerText = 'Save Changes';
                            saveBtn.style.gridColumn = '4/6';
                            saveBtn.style.marginTop = '0.5em';
                            saveBtn.style.fontSize = '0.7em';
                            seletedMsg.append(saveBtn);


                            const editBtns = document.getElementsByClassName('editBtn');
                            for (let m = 0; m < editBtns.length; m++) { editBtns[m].disabled = true; };

                            cancelBtn.addEventListener('click', () => {
                                for (let m = 0; m < editBtns.length; m++) { editBtns[m].disabled = false; }
                                seletedMsg.removeChild(seletedMsg.lastChild);
                                seletedMsg.removeChild(seletedMsg.lastChild);
                                seletedMsg.replaceChild(formerMsg, editWindow);
                            });
                            saveBtn.addEventListener('click', () => {
                                // console.log(seletedMsg.children);
                                // console.log(editWindow.innerText, formerMsg.innerText);
                                if (editWindow.innerText.match(/^\s*$/)) {
                                    alert('empty message or message containing only whitespace!!!!');
                                    editWindow.innerText = formerMsg.innerText;
                                } else if (editWindow.innerText === formerMsg.innerText) {
                                    alert('cannot edit a message to the same existing message...');
                                    // seletedMsg.replaceChild(seletedMsg.children[1], editWindow);
                                } else {
                                    const token = localStorage.getItem('token');
                                    const currentChannelId = localStorage.getItem('currentChannelId');
                                    const editInfo = JSON.stringify({
                                        message: editWindow.innerText,
                                        image: '',
                                    });
                                    // console.log(editInfo);

                                    requestOptions = {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': 'Bearer ' + token,
                                        },
                                        body: editInfo,
                                    };
                                    fetch(`http://localhost:${BACKEND_PORT}/message/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                                        if (response.status === 200) {
                                            response.json().then((data) => {
                                                for (let m = 0; m < editBtns.length; m++) { editBtns[m].disabled = false; };
                                                refreshCurrentChannelMsg(currentChannelId, token, allUsersInfo);
                                            });
                                        } else {
                                            alert("sendMessage failed...");
                                        }
                                    });
                                };
                            })
                        });
                    } else {
                        editMessage.addEventListener('click', () => {
                            updateInfoPopup('You are not the sender of this message, not permission to edit it!');
                        });
                    };


                    // delete messages
                    const deleteMessage = newMsgEditBtn.children[1].children[1];
                    if (messages[n]['sender'] == parseInt(localStorage.getItem('userId'))) {
                        deleteMessage.addEventListener('click', () => {
                            requestOptions = {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token,
                                }
                            };

                            fetch(`http://localhost:${BACKEND_PORT}/message/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                                if (response.status === 200) {
                                    response.json().then((data) => {
                                        const currentChannelId = localStorage.getItem('currentChannelId');
                                        refreshCurrentChannelMsg(currentChannelId, token, allUsersInfo);
                                    });
                                } else { alert("editMessage failed...") }
                            });
                        });

                    } else {
                        deleteMessage.addEventListener('click', () => {
                            updateInfoPopup('You are not the sender of this message, not permission to delete it!');
                        });
                    };


                    // pin & unpin message 
                    const pinMessage = newMsgEditBtn.children[1].children[2];
                    pinMessage.addEventListener('click', () => {
                        requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token,
                            }
                        };
                        let seletedMsg = document.getElementById(messages[n]['id']);
                        if (pinMessage.children[0].innerText === 'Pin to channel') {

                            seletedMsg.style.backgroundColor = 'rgb(255,202,10, 0.3)';
                            const pin = document.getElementById("pinEmoji");
                            const newPin = pin.cloneNode(true);
                            newPin.id = `pin${messages[n]['id']}`;
                            newPin.style.display = 'block';
                            // console.log(seletedMsg.children[3]);
                            seletedMsg.children[4].append(newPin);
                            pinMessage.children[0].innerText = 'Un-pin from channel';

                            fetch(`http://localhost:${BACKEND_PORT}/message/pin/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                                if (response.status === 200) {
                                    response.json().then((data) => {
                                        console.log("pinMessage succeed!!!");
                                        const chatCopy = chat.cloneNode(true);
                                        chatCopy.id = `copy${chat.id}`;
                                        pinPopup.insertBefore(chatCopy, pinPopup.firstElementChild);
                                    });
                                } else {
                                    alert("pinMessage failed...");
                                }
                            });

                        } else {
                            seletedMsg.style.backgroundColor = '';
                            // console.log(seletedMsg.children[3]);
                            // console.log(document.getElementById(`pin${messages[n]['id']}`));
                            seletedMsg.children[4].removeChild(seletedMsg.children[4].children[1]);
                            pinMessage.children[0].innerText = 'Pin to channel';
                            fetch(`http://localhost:${BACKEND_PORT}/message/unpin/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                                if (response.status === 200) {
                                    response.json().then((data) => {
                                        console.log("unpinMessage succeed!!!");
                                        const chatCopy = chat.cloneNode(true);
                                        chatCopy.id = `copy${chat.id}`;
                                        pinPopup.removeChild(document.getElementById(chatCopy.id));
                                    });
                                } else {
                                    alert("unpinMessage failed...");
                                }
                            });
                        };

                    });

                    // react & unreact message
                    const reactMessages = newMsgEditBtn.children[1].children[3].children;
                    for (let m = 0; m < reactMessages.length; m++) {

                        reactMessages[m].addEventListener('mouseover', () => {
                            reactMessages[m].style.cursor = 'pointer';
                        });

                        reactMessages[m].addEventListener('click', () => {
                            let seletedMsg = document.getElementById(messages[n]['id']);
                            let emojiExist = false;
                            let allReactsAfterUnreact = '';
                            for (let k = 0; k < seletedMsg.children[3].innerText.split(' ').length; k++) {
                                if (seletedMsg.children[3].innerText.split(' ')[k] === reactMessages[m].innerText) {
                                    emojiExist = true;
                                } else {
                                    allReactsAfterUnreact += ` ${seletedMsg.children[3].innerText.split(' ')[k]}`;
                                }
                            };
                            // console.log(b.match('\u{1F44D}'));
                            // throw 100;
                            if (!emojiExist) {
                                fetch(`http://localhost:${BACKEND_PORT}/message/react/${id}/${messages[n]['id']}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer ' + token,
                                    },
                                    body: JSON.stringify({
                                        react: reactMessages[m].innerText,
                                    }),
                                }).then((response) => {
                                    if (response.status === 200) {
                                        seletedMsg.children[3].innerText += ` ${reactMessages[m].innerText}`;
                                        // alert("reactMessage succeeded...");
                                    } else { alert("reactMessage failed..."); }
                                });
                            } else {
                                fetch(`http://localhost:${BACKEND_PORT}/message/unreact/${id}/${messages[n]['id']}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer ' + token,
                                    },
                                    body: JSON.stringify({
                                        react: reactMessages[m].innerText,
                                    }),
                                }).then((response) => {
                                    if (response.status === 200) {
                                        seletedMsg.children[3].innerText = allReactsAfterUnreact;
                                    } else {
                                        alert("unreactMessage failed...");
                                    };
                                })
                            };

                        })
                    };

                    // append the message(text) box
                    chat.append(createBox('span', 'messageContent', messages[n]['message']));
                    let tempReact = '';
                    for (let m = 0; m < messages[n]['reacts'].length; m++) {
                        tempReact += ` ${messages[n]['reacts'][m]['react']}`;
                    };

                    // append the message(image) box
                    const messageImageBox = createBox('span', 'messageImageBox', '');
                    const messageImage = document.createElement('img');
                    messageImage.src = messages[n]['image'];
                    if (messageImage.src.match(/^data:image\/.+/)) {
                        messageImage.id = `photo${currentPhotoId}`;
                        currentPhotoId += 1;
                        photos.push(messageImage.src);
                    }
                    messageImageBox.append(messageImage);
                    chat.append(messageImageBox);


                    messageImage.addEventListener('mouseover', () => {
                        messageImage.style.cursor = 'pointer';
                    });

                    messageImage.addEventListener('click', () => {
                        document.getElementById('messageImageEnlarged').firstChild.src = messageImage.src;
                        document.getElementById('messageImageEnlarged').firstChild.id = `enlarged${messageImage.id}`;
                        displayContentById('messageImageEnlargeMask');
                    });

                    // append the messageReact box
                    chat.append(createBox('span', 'messageReactBar', tempReact));

                    // append the messageSenderProfilePicture box
                    const imgBox = createBox('div', 'messageSenderImg', '');
                    const img = document.createElement('img');
                    (allUsersInfo[messages[n]['sender']]['image']) ? img.src = allUsersInfo[messages[n]['sender']]['image']:
                        img.src = '../images/person-lines-fill.svg';
                    imgBox.append(img);
                    // console.log(messages[n]['pinned']);
                    if (messages[n]['pinned'] === true) {
                        const getPin = document.getElementById("pinEmoji").cloneNode(true);;
                        getPin.id = `pin${messages[n]['id']}`;
                        getPin.style.display = 'block';
                        imgBox.append(getPin);
                        chat.style.backgroundColor = 'rgb(255,202,10, 0.3)';
                        newMsgEditBtn.children[1].children[2].children[0].innerText = 'Un-pin from channel';
                    } else {
                        newMsgEditBtn.children[1].children[2].children[0].innerText = 'Pin to channel';
                    }
                    chat.append(imgBox);

                    if (messages[n]['pinned'] === true) {
                        const chatCopy = chat.cloneNode(true);
                        chatCopy.id = `copy${chat.id}`;
                        pinPopup.insertBefore(chatCopy, pinPopup.firstElementChild);
                        // console.log(chat);
                        // console.log(chatCopy);
                    };
                    currentChannelChatBox.insertBefore(chat, currentChannelChatBox.firstElementChild);
                }
                currentChannelChatBox.scrollTop = currentChannelChatBox.scrollHeight;
            });
        } else {
            alert("refreshMessages failed...");
        }
    });
}

const moveOverOutSetting = (element) => {
    element.addEventListener('mouseover', () => {
        element.style.cursor = 'pointer';
        element.style.backgroundColor = 'rgb(238, 238, 238)';
    });
    element.addEventListener('mouseout', () => {
        element.style.backgroundColor = '';
    });
};
const messageImageBack = document.getElementById('messageImageBack');
const messageImageForward = document.getElementById('messageImageForward');
const messageImageEnlarged = document.getElementById('messageImageEnlarged');

moveOverOutSetting(messageImageBack);
moveOverOutSetting(messageImageForward);

let currentEnlargedPhotoIndex = -1;
messageImageBack.addEventListener('click', () => {
    // console.log(messageImageEnlarged.firstChild.id);
    currentEnlargedPhotoIndex = parseInt(messageImageEnlarged.firstChild.id.match(/\d+/)[0]);
    (currentEnlargedPhotoIndex === photos.length - 1) ? currentEnlargedPhotoIndex = 0: currentEnlargedPhotoIndex += 1;
    messageImageEnlarged.firstChild.src = photos[currentEnlargedPhotoIndex];
    messageImageEnlarged.firstChild.id = `enlargedphoto${currentEnlargedPhotoIndex}`;
});

messageImageForward.addEventListener('click', () => {
    currentEnlargedPhotoIndex = parseInt(messageImageEnlarged.firstChild.id.match(/\d+/)[0]);
    (currentEnlargedPhotoIndex === 0) ? currentEnlargedPhotoIndex = photos.length - 1: currentEnlargedPhotoIndex -= 1;
    messageImageEnlarged.firstChild.src = photos[currentEnlargedPhotoIndex];
    messageImageEnlarged.firstChild.id = `enlargedphoto${currentEnlargedPhotoIndex}`;
});


// send a picture
document.getElementById('sendPictureBtn').addEventListener('change', () => {

    const file = document.getElementById('sendPictureBtn').files[0];
    fileToDataUrl(file).then(data => { document.getElementById('sendPictureShow').src = data; });
});

// send a message
document.getElementById('sendMsgBtn').addEventListener('click', () => {
    const msgContent = document.getElementById('currentChannelInput').innerText;
    let imgContent = '';
    // console.log(msgContent);
    if (msgContent.match(/^\s*$/) && document.getElementById('sendPictureShow').src !== null &&
        !document.getElementById('sendPictureShow').src.match(/^data:image\/.+/)) {
        updateInfoPopup('Sorry, you cannot empty messages...');

    } else if (!msgContent.match(/^\s*$/) &&
        document.getElementById('sendPictureShow').src !== null &&
        document.getElementById('sendPictureShow').src.match(/^data:image\/.+/)) {
        updateInfoPopup('Sorry, you cannot send messages and photos together...');
    } else {
        if (document.getElementById('sendPictureShow').src !== null &&
            document.getElementById('sendPictureShow').src.match(/^data:image\/.+/)) {
            imgContent = document.getElementById('sendPictureShow').src;
        };
        const token = localStorage.getItem('token');
        const currentChannelId = localStorage.getItem('currentChannelId');
        // console.log('currentChannelId',currentChannelId);
        const msgInfo = JSON.stringify({
            message: msgContent,
            image: imgContent,
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: msgInfo,
        };

        fetch(`http://localhost:${BACKEND_PORT}/message/${currentChannelId}`, requestOptions).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    document.getElementById('currentChannelInput').innerText = '';
                    document.getElementById('sendPictureShow').src = '';
                    refreshCurrentChannelMsg(currentChannelId, token, allUsersInfo);
                });
            } else { alert("sendMessage failed...") }
        });
    }
})