({
    // 共有 CometD 接続を使用してプラットフォームイベントチャネルに登録
    subscribe: function (component, event, helper, utilityId) {
        const empApi = component.find('empApi');
        const channel = component.get('v.channel');
        // イベント登録.
        const replayId = -1;
        const callback = message => {
            console.log('イベント取得 : ' + JSON.stringify(message));
            // イベントからデータ取得
            const {
                EventType__c:eventType,
                ResponseTarget__c:targetId, // 受信者Id
                RequestedRecordId__c:requestedRecordId, // イベント元レコードId
                RequestedObjectApiName__c:objectApiName // イベント元オブジェクト
            } = message.data.payload;
            // 現在のユーザId
            const currentUserId = $A.get("$SObjectType.CurrentUser.Id");
            if(targetId !== currentUserId) return;
            component.set('v.requestRecId' , requestedRecordId);
            component.set('v.requestedObjectApiName' , objectApiName);
            helper.onReceiveNotification(component, helper ,message, utilityId , objectApiName,eventType);
        };
        // チャネルをサブスクライブし、返されたサブスクリプションオブジェクトを保存
        empApi.subscribe(channel, replayId, $A.getCallback(callback))
            .then($A.getCallback(newSubscription => {
                console.log('登録済みチャンネル ' + channel);
                component.set('v.subscription', newSubscription);
            }));
    },
    // プラットフォームイベントチャネルから登録解除
    unsubscribe: function (component, event, helper) {
        const empApi = component.find('empApi');
        const channel = component.get('v.subscription').channel;
        const callback = message => {
            console.log('チャネルから削除 ' + message.channel);
        };
        // サブスクオブジェクトからチャネルを削除
        empApi.unsubscribe(component.get('v.subscription'), $A.getCallback(callback));
    },
    // プラットフォームイベントメッセージ受信処理
    onReceiveNotification: function (component, helper, message, utilityId , objectApiName ,eventType) {
        if(eventType === 'PUBLISH'){
            console.log("プラットフォームイベントメッセージ受信処理:PUBLISH")
            // イベントからデータ取得
            helper.getNotificationRecords(component,helper);
            // ハイライト
            helper.setHighLight(component);
            setTimeout(() => {
                helper.turnOffHighLight(component);
            },5000)
            // トースト表示
            const toastConfig = {
                type : 'warning',
                title : "支援要求が届いています!",
                messageBody : "「エスカレーション通知」を確認してください！",
            }
            this.displayToast(component, toastConfig);
        } else if(eventType === 'CANCEL'){
            // 支援キャンセル時の処理を記載
            console.log("プラットフォームイベントメッセージ受信処理:CANCEL");
            helper.getNotificationRecords(component,helper);
            setTimeout(() => {
                let notifications = component.get('v.notifications');
                if(!notifications.length){
                    helper.turnOffHighLight(component);
                }
            }, 1000);
            // component.set("v.isNotReqest" , notifications.length > 0 ? false : true );
        }
    },
    // トースト処理
    displayToast: function (component, toastConfig) {
        const {type , title , messageBody} = toastConfig;
        const toastEvent = $A.get('e.force:showToast');
        toastEvent.setParams({
            mode: "sticky",
            message:messageBody,
            title,
            type
        });
        toastEvent.fire();
    }
    ,
    // チャネル名取得
    getChannelName:function(objectApiName){
        switch(objectApiName){
            case "チャット":
                return "LiveChatTranscript";
            case "LINE":
                return "Case";
            case "電話":
                return "VoiceCall";
            default: break;
        }
    },

    getNotificationRecords:function (component,helper){
        console.log("getNotificationRecords called");
        let notifications = component.get('v.notifications');
        let action = component.get("c.getNotificationRecords");
        action.setCallback(this , res => {
            let state = res.getState();
            if(state === 'SUCCESS'){
                // NotificationReocrd : {
                //  ChannelId: "5705D000000HdP7QAK"
                //  Primary: "高"
                //  RequestAgentName: "瀧山 恭平"
                //  RequestedObjectApiName: "LiveChatTranscript"
                //  ResponseAgentName: "0055D000004ZC2ZQAW"
                //  recId: "a2m5D000005ZeZwQAK"
                // }
                const getrecords = res.getReturnValue();
                notifications = [];
                notifications = [...getrecords];
                component.set('v.notifications', notifications);
                console.log("notifications",JSON.stringify(notifications));
                component.set("v.isNotReqest" , notifications.length === 0 ? true : false );
            } else {
                console.log("res.getError()",res.getError());
            }
        })
        $A.enqueueAction(action);
    },
    turnOffHighLight:function(component){
        let navService = component.find("navigationService");
        let utilityAPI = component.find("utilitybar");
        let utilityId = component.get('v.utilityId');
        utilityAPI.setUtilityHighlighted({ utilityId,  highlighted:false });
    },
    // ハイライト
    setHighLight:function(component){
        console.log("setHighLight called");
        let navService = component.find("navigationService");
        let utilityAPI = component.find("utilitybar");
        let utilityId = component.get('v.utilityId');
        utilityAPI.setUtilityHighlighted({ utilityId,  highlighted:true });
    },
    // バー閉じる
    closeBar:function(component){
        let navService = component.find("navigationService");
        let utilityAPI = component.find("utilitybar");
        let utilityId = component.get('v.utilityId');
        utilityAPI.minimizeUtility({ utilityId });
    },
})
