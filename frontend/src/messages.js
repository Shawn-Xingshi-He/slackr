const createBox = (boxType, givenClass, message) => {
    const box = document.createElement(boxType);
    box.className = givenClass;
    box.innerText = message;
    return box;
}

export const timeStampSwitch = (time) => {
    let re = time.match(/^(.*)T(\d*:\d*):/);
    // console.log(re);
    return re;

}

export const refreshCurrentChannelMsg = (id, token) => {
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
                console.log(data);
                let messages = data['messages'];
                const currentChannelChatBox = document.getElementById('currentChannelChatBox');
                while (currentChannelChatBox.hasChildNodes()) {
                    currentChannelChatBox.removeChild(currentChannelChatBox.lastChild);
                };
                for (let n = 0; n < messages.length; n++) {
                    const chat = document.createElement('div');
                    chat.id = messages[n]['id'];
                    chat.className = 'oneMessage';
                    const senderAndTime = createBox('span', 'messageSender', `${messages[n]['sender']} `);
                    senderAndTime.append(createBox('span', 'messageTimeStamp', timeStampSwitch(messages[n]['sentAt'])[1] +
                        ' ' + timeStampSwitch(messages[n]['sentAt'])[2]));

                    const messageEditBtn = document.getElementById("messageEditBtn");
                    const newMsgEditBtn = messageEditBtn.cloneNode(true);
                    // console.log(newMsgEditBtn);
                    // newMsgEditBtn.id = messages[n]['id'];
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
                        seletedMsg.replaceChild(editWindow, seletedMsg.children[1]);

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

                        });
                        saveBtn.addEventListener('click', () => {
                            const token = localStorage.getItem('token');
                            const currentChannelId = localStorage.getItem('currentChannelId');
                            const editInfo = JSON.stringify({
                                message: editWindow.innerText,
                                image: '',
                            });
                            console.log(editInfo);

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
                                        refreshCurrentChannelMsg(currentChannelId, token);
                                    });
                                } else {
                                    alert("sendMessage failed...");
                                }
                            });
                        });

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
                                    refreshCurrentChannelMsg(currentChannelId, token);
                                });
                            } else {
                                alert("editMessage failed...");
                            }
                        });

                    });

                    const pinMessage = newMsgEditBtn.children[1].children[2];
                    senderAndTime.append(newMsgEditBtn);
                    // console.log(prime);
                    chat.append(senderAndTime);
                    chat.append(createBox('span', 'messageContent', messages[n]['message']));

                    // if ()
                    const imgBox = createBox('div', 'messageSenderImg', '');
                    const img = document.createElement('img');
                    img.src = '../images/person-lines-fill.svg';
                    imgBox.append(img)
                    chat.append(imgBox);
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
    // console.log(msgContent);
    if (msgContent.match(/^\s*$/)) {
        console.log(false);
    } else {
        const token = localStorage.getItem('token');
        const currentChannelId = localStorage.getItem('currentChannelId');
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
                    refreshCurrentChannelMsg(currentChannelId, token);
                });
            } else {
                alert("sendMessage failed...");
            }
        });
    }
})