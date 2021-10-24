import { allUsersInfo } from "./users.js";
import { displayContentById } from "./utility.js";

const userId = localStorage.getItem('userId');

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
    // console.log(re);
    return re;

}

export const refreshCurrentChannelMsg = (id, token, allUsersInfo) => {
    let requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    };
    fetch(`http://localhost:5005/message/${id}?start=0`, requestOptions).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                // console.log(data);
                let messages = data['messages'];

                cleanAllChildren('currentChannelChatBox');
                cleanAllChildren('pinPopup');

                for (let n = 0; n < messages.length; n++) {
                    const chat = document.createElement('div');
                    chat.id = messages[n]['id'];
                    chat.className = 'oneMessage';
                    // console.log(messages[n]['sender']);
                    // console.log(allUsersInfo);
                    // console.log(allUsersInfo[messages[n]['sender']]);

                    const senderName = allUsersInfo[messages[n]['sender']]['name'];
                    const senderBox = createBox('span', '', `${senderName}`);
                    const senderAndTime = createBox('span', 'messageSender', '');
                    senderAndTime.append(senderBox);
                    const timeBox = createBox('span', 'messageTimeStamp', ' ' + timeStampSwitch(messages[n]['sentAt'])[1] +
                        ' ' + timeStampSwitch(messages[n]['sentAt'])[2]);
                    timeBox.style.fontSize = '0.8em';
                    timeBox.style.color = '#3D3F40';
                    senderAndTime.append(timeBox);

                    // click on a users' name on a given message, their profile screen should be displayed.
                    senderBox.addEventListener('mouseover', () => {
                        senderBox.style.cursor = 'pointer';
                        senderBox.style.textDecoration = 'underline';
                    })
                    senderBox.addEventListener('mouseout', () => {
                        senderBox.style.textDecoration = '';
                    })

                    senderBox.addEventListener('click', () => {
                        fetch(`http://localhost:5005/user/${messages[n]['sender']}`, {
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
                                    document.getElementById("oneUserPhoto").innerText = data['image'];
                                    document.getElementById("oneUserProfileTitle").children[0].innerText = `${data['name']}'s profile`;
                                    displayContentById("oneUserProfileMask");
                                });
                            };
                        })
                    });


                    const messageEditBtn = document.getElementById("messageEditBtn");
                    let newMsgEditBtn = messageEditBtn.cloneNode(true);
                    // console.log('messageEditBtn', messageEditBtn);
                    // console.log('newMsgEditBtn', newMsgEditBtn);
                    newMsgEditBtn.style.display = 'block';
                    newMsgEditBtn.style.float = 'right';

                    // edit a message
                    const editMessage = newMsgEditBtn.children[1].children[0];
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
                                fetch(`http://localhost:5005/message/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
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

                    // delete messages
                    const deleteMessage = newMsgEditBtn.children[1].children[1];
                    deleteMessage.addEventListener('click', () => {
                        requestOptions = {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token,
                            }
                        };

                        fetch(`http://localhost:5005/message/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                            if (response.status === 200) {
                                response.json().then((data) => {
                                    const currentChannelId = localStorage.getItem('currentChannelId');
                                    refreshCurrentChannelMsg(currentChannelId, token, allUsersInfo);
                                });
                            } else {
                                alert("editMessage failed...");
                            }
                        });

                    });


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
                            seletedMsg.children[3].append(newPin);
                            pinMessage.children[0].innerText = 'Un-pin from channel';

                            fetch(`http://localhost:5005/message/pin/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                                if (response.status === 200) {
                                    response.json().then((data) => {
                                        console.log("pinMessage succeed!!!")
                                    });
                                } else {
                                    alert("pinMessage failed...");
                                }
                            });

                        } else {
                            seletedMsg.style.backgroundColor = '';
                            // console.log(seletedMsg.children[3]);
                            // console.log(document.getElementById(`pin${messages[n]['id']}`));
                            seletedMsg.children[3].removeChild(seletedMsg.children[3].children[1]);
                            pinMessage.children[0].innerText = 'Pin to channel';
                            fetch(`http://localhost:5005/message/unpin/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                                if (response.status === 200) {
                                    response.json().then((data) => {
                                        console.log("unpinMessage succeed!!!")
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
                        reactMessages[m].addEventListener('click', () => {
                            let seletedMsg = document.getElementById(messages[n]['id']);
                            let emojiExist = false;
                            let allReactsAfterUnreact = '';
                            for (let k = 0; k < seletedMsg.children[2].innerText.split(' ').length; k++) {
                                if (seletedMsg.children[2].innerText.split(' ')[k] === reactMessages[m].innerText) {
                                    emojiExist = true;
                                } else {
                                    allReactsAfterUnreact += ` ${seletedMsg.children[2].innerText.split(' ')[k]}`;
                                }
                            };
                            // console.log(b.match('\u{1F44D}'));
                            // throw 100;
                            if (!emojiExist) {
                                fetch(`http://localhost:5005/message/react/${id}/${messages[n]['id']}`, {
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
                                        seletedMsg.children[2].innerText += ` ${reactMessages[m].innerText}`;
                                        // alert("reactMessage succeeded...");
                                    } else { alert("reactMessage failed..."); }
                                });
                            } else {
                                fetch(`http://localhost:5005/message/unreact/${id}/${messages[n]['id']}`, {
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
                                        seletedMsg.children[2].innerText = allReactsAfterUnreact;
                                    } else {
                                        alert("unreactMessage failed...");
                                    };
                                })
                            };

                        })
                    };


                    const imgBox = createBox('div', 'messageSenderImg', '');
                    const img = document.createElement('img');
                    (allUsersInfo[messages[n]['sender']]['image']) ? img.src = allUsersInfo[messages[n]['sender']]['image']:
                        img.src = '../images/person-lines-fill.svg';;
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
                    senderAndTime.append(newMsgEditBtn);
                    // console.log(prime);
                    chat.append(senderAndTime);
                    chat.append(createBox('span', 'messageContent', messages[n]['message']));
                    let tempReact = '';
                    for (let m = 0; m < messages[n]['reacts'].length; m++) {
                        tempReact += ` ${messages[n]['reacts'][m]['react']}`;
                    };
                    chat.append(createBox('span', 'messageReactBar', tempReact));

                    // if ()

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

document.getElementById('sendMsgBtn').addEventListener('click', () => {
    const msgContent = document.getElementById('currentChannelInput').innerText;
    console.log(msgContent);
    if (msgContent.match(/^\s*$/)) {
        console.log(false);
    } else {
        const token = localStorage.getItem('token');
        const currentChannelId = localStorage.getItem('currentChannelId');
        // console.log('currentChannelId',currentChannelId);
        const msgInfo = JSON.stringify({
            message: msgContent,
            image: '',
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: msgInfo,
        };

        fetch(`http://localhost:5005/message/${currentChannelId}`, requestOptions).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    document.getElementById('currentChannelInput').innerText = '';
                    refreshCurrentChannelMsg(currentChannelId, token, allUsersInfo);
                });
            } else {
                alert("sendMessage failed...");
            }
        });
    }
})