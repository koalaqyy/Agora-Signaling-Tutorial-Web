(function ($) {
    $(() => {
        class Client {
            //construct a meeting client with signal client and rtc client
            constructor(sclient, localAccount) {
                this.signal = sclient;
                this.localAccount = localAccount;
                this.current_conversation = null;
                this.current_msgs = null;
                // this.cleanData();
                this.loadFromLocalStorage();
                this.updateChatList();

                this.subscribeEvents();
            }

            cleanData() {
                localStorage.setItem("chats", "");
                localStorage.setItem("messages", "");
            }

            updateLocalStorage() {
                localStorage.setItem("chats", JSON.stringify(this.chats));
                localStorage.setItem("messages", JSON.stringify(this.messages));
            }

            loadFromLocalStorage() {
                this.chats = JSON.parse(localStorage.getItem("chats") || "[]");
                this.messages = JSON.parse(localStorage.getItem("messages") || "{}");
            }

            updateChatList() {
                let client = this;
                let chatsContainer = $(".chat-history");
                chatsContainer.html("");
                let html = "";
                for (var i = 0; i < this.chats.length; i++) {
                    html += "<li name=\"" + this.chats[i].id + "\" type=\" + this.chats[i].type +\">";
                    html += "<div class=\"title\">" + this.chats[i].account + "</div>";
                    html += "<div class=\"desc\">" + this.chats[i].type + "</div>";
                    html += "</li>";
                }
                chatsContainer.html(html);

                $(".chat-history li").off("click").on("click", function () {
                    let mid = $(this).attr("name");
                    let type = $(this).attr("type");
                    if(type === "channel"){
                        // client.signal.join()
                        client.showMessage(mid);
                    } else {
                        client.showMessage(mid);
                    }
                });

                if (this.chats.length > 0) {
                    this.showMessage(this.chats[0].id);
                }
            }

            showMessage(mid) {
                let client = this;
                this.current_msgs = this.messages[mid] || [];
                let conversation = this.chats.filter(function (item) {
                    return (item.id + "") === (mid + "");
                })
                if (conversation.length === 0) {
                    return;
                }
                this.current_conversation = conversation[0];
                this.current_msgs = this.messages[this.current_conversation.id] || [];


                $('#message-to-send').off("keydown").on("keydown", function (e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        client.sendMessage($(this).val());
                        $(this).val("");
                    }
                });

                $(".chat-messages").html("");
                let html = "";
                for (let i = 0; i < this.current_msgs.length; i++) {
                    html += this.buildMsg(this.current_msgs[i].text, this.current_msgs[i].account === this.localAccount, this.current_msgs[i].ts);
                }
                $(".chat-history li").removeClass("selected");
                $(".chat-history li[name=" + mid + "]").addClass("selected");
                $(".chat-messages").html(html);
                $(".detail .nav").html(conversation[0].account);
            }

            sendMessage(text) {
                if (!this.current_msgs) {
                    return;
                }
                let msg_item = { ts: new Date(), text: text, account: this.localAccount };
                this.current_msgs.push(msg_item);
                if (this.current_conversation.type === "instant") {
                    this.signal.sendMessage(this.current_conversation.account, text);
                } else {
                    this.signal.messageChannelSend(text);
                }

                $(".chat-messages").append(this.buildMsg(text, true, msg_item.ts));

                this.updateMessageMap();
            }

            updateMessageMap(c, m) {
                let conversation = c || this.current_conversation;
                let msgs = m || this.current_msgs;
                this.messages[conversation.id] = msgs;
                this.updateLocalStorage();
            }

            //return a promise resolves a remote account name
            addConversation() {
                let deferred = $.Deferred();
                let dialog = $(".conversation-modal");
                let accountField = dialog.find(".remoteAccountField");
                let localAccount = this.localAccount;
                let client = this;

                dialog.find(".confirmBtn").off("click").on("click", (e) => {
                    //dialog confirm
                    let account = $(".conversation-target-field").val();
                    let type = $(':radio[name="type"]').filter(':checked').val();
                    let conversations = client.chats.filter(function(item){
                        return item.account === account;
                    });

                    if (!account) {
                        $(".conversation-target-field").siblings(".invalid-feedback").html("请输入一个合法的名字.")
                        $(".conversation-target-field").removeClass("is-invalid").addClass("is-invalid");
                    } else if (`${account}` === `${localAccount}`) {
                        $(".conversation-target-field").siblings(".invalid-feedback").html("你不能跟自己聊天.")
                        $(".conversation-target-field").removeClass("is-invalid").addClass("is-invalid");
                    } else if (conversations.length > 0){
                        $(".conversation-target-field").siblings(".invalid-feedback").html("该聊天已存在.")
                        $(".conversation-target-field").removeClass("is-invalid").addClass("is-invalid");
                    } else {
                        dialog.modal('hide');
                        client.chats.splice(0, 0, { id: new Date().getTime(), account: account, type: type });
                        client.updateLocalStorage();
                        client.updateChatList();
                        deferred.resolve(account);
                    }
                });

                dialog.find(".cancelBtn").off("click").on("click", (e) => {
                    //dialog confirm
                    dialog.modal('hide');
                    deferred.reject();
                });

                //start modal
                dialog.modal({ backdrop: "static", focus: true });

                return deferred;
            }

            //events
            subscribeEvents() {
                let signal = this.signal;
                let client = this;

                $(".new-conversation-btn").off("click").on("click", function () {
                    client.addConversation();
                });

                $(':radio[name="type"]').change(function () {
                    var type = $(this).filter(':checked').val();
                    var field = $(".conversation-target-field");
                    switch (type) {
                        case "instant":
                            field.attr("placeholder", "输入聊天对象账号");
                            break;
                        case "channel":
                            field.attr("placeholder", "输入聊天频道");
                            break;
                    }
                });

                signal.onMessageInstantReceive = $.proxy(this.onReceiveMessage, this);
            }

            onReceiveMessage(account, msg, type) {
                let client = this;
                var conversations = this.chats.filter(function (item) {
                    return item.account === account;
                });

                if (conversations.length === 0) {
                    //no conversation yet, create one
                    conversations = [{ id: new Date().getTime(), account: account, type: type }];
                    client.chats.splice(0, 0, conversations[0]);
                    client.updateLocalStorage();
                    client.updateChatList();
                }

                for (let i = 0; i < conversations.length; i++) {
                    let conversation = conversations[i];

                    let msgs = this.messages[conversation.id] || [];
                    let msg_item = { ts: new Date(), text: msg, account: account };
                    msgs.push(msg_item);
                    this.updateMessageMap(conversation, msgs);

                    if (conversation.id+"" === this.current_conversation.id+"") {
                        $(".chat-messages").append(client.buildMsg(msg, false, msg_item.ts));
                    }
                }
            }

            buildMsg(msg, me, ts){
                let html = "";
                let className = me ? "message right" : "message";
                html += "<li class=\"" + className +"\">";
                html += "<img src=\"https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg\">";
                html += "<div class=\"bubble\">" + msg + "<div class=\"corner\"></div>";
                html += "<span>" + this.parseTwitterDate(ts) + "</span></div></li>";

                return html;
            }

            parseTwitterDate(tdate) {
                var system_date = new Date(Date.parse(tdate));
                var user_date = new Date();
                // if (K.ie) {
                //     system_date = Date.parse(tdate.replace(/( \+)/, ' UTC$1'))
                // }
                var diff = Math.floor((user_date - system_date) / 1000);
                if (diff <= 1) {return "just now";}
                if (diff < 20) {return diff + " seconds ago";}
                if (diff < 40) {return "half a minute ago";}
                if (diff < 60) {return "less than a minute ago";}
                if (diff <= 90) {return "one minute ago";}
                if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
                if (diff <= 5400) {return "1 hour ago";}
                if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
                if (diff <= 129600) {return "1 day ago";}
                if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
                if (diff <= 777600) {return "1 week ago";}
                return "on " + system_date;
            }
        }

        const appid = "672fac5cd7194d26908a15900c6d6484", appcert = "a31c1044fe4040ba8d1af4ba3f5165f9";
        let localAccount = Browser.getParameterByName("account");
        let signal = new SignalingClient(appid, appcert);
        let client = new Client(signal, localAccount);
        let channelName = Math.random() * 10000 + "";
        //by default call btn is disabled
        signal.login(localAccount).done(_ => {
            //once logged in, enable the call btn
        });
    });
}(jQuery));