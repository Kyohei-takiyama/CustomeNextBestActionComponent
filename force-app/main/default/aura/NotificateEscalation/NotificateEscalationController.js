({
    /**
     * @description ユーティリティバー情報を取得
     * @param {*} cmp
     * @param {*} event
     * @param {*} helper
     */
    init: function (component, event, helper) {
        let utilityAPI = component.find("utilitybar");// ユーティリティバーAPI取得
        component.set("v.subscription" , null);
        const empApi = component.find("empApi");
        // empApiのエラーハンドリング
        const errorHandler = message => {
            console.error('empApiエラー***** : ', JSON.stringify(message));
        }
        let utilityId;
        // エラーイベントリスナー
        empApi.onError($A.getCallback(errorHandler));
        utilityAPI.getAllUtilityInfo().then(function(response) {
            for (let record of response) {
                if(record.utilityLabel === "エスカレーション通知"){
                    component.set("v.utilityId" , record.id);
                    console.log("utilityId",record.id);//ユーティリティの ID
                    console.log(record.utilityLabel);//ユーティリティの表示ラベル。
                    component.set("v.label" , record.utilityLabel);
                    utilityId = component.get("v.utilityId");
                    console.log("utilityId",utilityId)
                }
			}
        });
        // エスカレーションレコード取得
        helper.getNotificationRecords(component,helper);
        // チャンネル登録
        helper.subscribe(component , event , helper , utilityId);
    },
    onClear : function(component , event , helper){
        component.set("v.notifications" , []);
    },
    // レコードId取得
    onRecordIdChange : function(component, event, helper) {
        var newRecordId = component.get("v.recordId");
        console.log("エスカレーション通知コンテキストId",newRecordId);
    }
    ,
    // ナビゲーション処理
    navigateRecordPage:function(component , event ,helper){
        let navService = component.find("navigationService");
        let utilityAPI = component.find("utilitybar");
        let utilityId = component.get('v.utilityId');
        const recordId = event.getSource().get("v.name");
        const objectApiName = helper.getChannelName(event.getSource().get("v.value"));
        let pageReference = {
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                recordId,
                objectApiName,
            }
        };
        // let action = component.get("c.updateNotificationRecord");
        // action.setCallback(this , res => {
        //     let state = res.getState();
        //     if(state === 'SUCCESS'){
        //         action.setParam({ "recId" : recordId })
        //     } else {
        //         console.log("res.getError()",res.getError());
        //     }
        // })
        // $A.enqueueAction(action);
        // ハイライト消す
        // utilityAPI.setUtilityHighlighted({ utilityId,  highlighted:false });
        // レコードページ遷移
        navService.navigate(pageReference);
    },

    resetButton: function(component){
        const notifications = component.get('v.notifications');
        console.log("notifications",notifications)
        component.set('v.notifications', []);
        console.log("notifications",notifications)
    }
    ,
    handleActive: function (component, event, helper) {
        // エスカレーションレコード初期化
        helper.getNotificationRecords(component,helper);
    }
})
