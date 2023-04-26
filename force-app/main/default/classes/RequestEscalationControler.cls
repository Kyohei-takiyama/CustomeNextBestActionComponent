public with sharing class RequestEscalationControler {


    private static String STATUS_REQUESTING = '要求';

    // ユーザ情報取得
    @AuraEnabled(cacheable=true)
    public static User getUserData() {
      return [
        SELECT Id, Name, SmallPhotoUrl,ManagerId
        FROM User
        WHERE Id = :UserInfo.getUserId()
      ];
    }

    // エスカレーション要求取得
    @AuraEnabled
    public static List<Notification> getNotificationRecords() {
        List<Notification> lst_notification = new List<Notification>();
        for(RequestNotification__c rn : [
            SELECT Id, Name, ChannelId__c, Primary__c,ResponseAgentName__c, RequestAgentName__c,RequestedObjectApiName__c,RequestStatus__c
            FROM RequestNotification__c WHERE RequestStatus__c =:STATUS_REQUESTING ORDER BY CreatedDate DESC
        ]) {
            lst_notification.add(
                new Notification(
                    rn.Id,
                    rn.ChannelId__c,
                    rn.Primary__c,
                    rn.ResponseAgentName__c,
                    rn.RequestAgentName__c,
                    rn.RequestedObjectApiName__c,
                    rn.RequestStatus__c
                )
            );
        }
        return lst_notification;
    }

    // 通知イベント作成処理
    @AuraEnabled
    public static void publish(String eventType,String agentName , String primary , String managerId , String requestRecId , String objectApiName){
        List<NotificateEscalation__e> notifications = new List<NotificateEscalation__e>();
        // 通知イベント作成
        NotificateEscalation__e notification = new NotificateEscalation__e();
        notification.EventType__c = eventtype;
        notification.AgentName__c = agentName;
        notification.Primary__c = primary;
        notification.ResponseTarget__c = managerId;
        notification.RequestedRecordId__c = requestRecId;
        notification.RequestedObjectApiName__c = objectApiName;
        notifications.add(notification);
        List<Database.SaveResult> results = EventBus.publish(notifications);

        for (Database.SaveResult result : results) {
            System.debug(Eventbus.getOperationId(result));
            if (!result.isSuccess()) {
                for (Database.Error error : result.getErrors()) {
                    System.debug('エスカレーションエラー　: ' + error.getStatusCode() +' - '+ error.getMessage());
                }
            }
        }
    }

    // エスカレーション要求レコード作成
    @AuraEnabled
    public static void createNotificationRecord(String agentName , String primary , String managerId , String requestRecId , String objectApiName,String status){
        List<RequestNotification__c> notifications = new List<RequestNotification__c>();
        // 通知イベント作成
        RequestNotification__c notification = new RequestNotification__c();
        notification.RequestAgentName__c = agentName;
        notification.ResponseAgentName__c = managerId;
        notification.Primary__c = primary;
        notification.ChannelId__c = requestRecId;
        notification.RequestedObjectApiName__c = objectApiName;
        notification.RequestStatus__c = '要求';
        notifications.add(notification);
        List<Database.SaveResult> results = Database.insert(notifications, true);

        for (Database.SaveResult result : results) {
            System.debug(result);
            if (!result.isSuccess()) {
                for (Database.Error error : result.getErrors()) {
                    System.debug('エスカレーションエラー　: ' + error.getStatusCode() +' - '+ error.getMessage());
                }
            }
        }
    }


    /**
     * エスカレーション要求レコード更新
     * キャンセル時処理
     */
    @AuraEnabled
    public static void cancelNotificationRecord(String agentName , String managerId , String requestRecId ,String objectApiName,String status,String eventtype){
        try{
            String STATUS_CANCEL = ObjectUtils.getPickListValueelected(RequestNotification__c.getSObjectType(), 'RequestStatus__c', status);
            // 通知イベント作成
            RequestNotification__c notificationToCancel = [SELECT RequestStatus__c FROM RequestNotification__c WHERE ChannelId__c =: requestRecId AND RequestStatus__c !=: STATUS_CANCEL];
            notificationToCancel.RequestStatus__c = STATUS_CANCEL;
            update notificationToCancel;

            // 通知イベント作成
            List<NotificateEscalation__e> notifications = new List<NotificateEscalation__e>();
            NotificateEscalation__e notification = new NotificateEscalation__e();
            notification.AgentName__c = agentName;
            notification.ResponseTarget__c = managerId;
            notification.RequestedObjectApiName__c = objectApiName;
            notification.EventType__c = eventtype;
            notification.RequestedRecordId__c = requestRecId;
            notifications.add(notification);
            List<Database.SaveResult> results = EventBus.publish(notifications);
        } catch(DmlException e){
            System.debug(e.getMessage());
        }
    }
    /**
     * エスカレーション要求対応時レコード更新
     * 対応時処理
     */
    @AuraEnabled
    public static void updateNotificationRecord(String recId){
        try{
            String STATUS_RESPONSE = ObjectUtils.getPickListValueelected(RequestNotification__c.getSObjectType(), 'RequestStatus__c', '対応');
            // 通知イベント作成
            RequestNotification__c notificationToUpdate = new RequestNotification__c(Id = recId , RequestStatus__c = STATUS_RESPONSE);
            update notificationToUpdate;
        } catch(DmlException e){
            System.debug(e.getMessage());
        }
    }


    class Notification{

        @AuraEnabled public String recId{get;set;}
        @AuraEnabled public String ChannelId{get;set;}
        @AuraEnabled public String Primary{get;set;}
        @AuraEnabled public String EventType{get;set;}
        @AuraEnabled public String ResponseAgentName{get;set;}
        @AuraEnabled public String RequestAgentName{get;set;}
        @AuraEnabled public String RequestedObjectApiName{get;set;}
        @AuraEnabled public String Status{get;set;}
        Notification(String recId,String channelId , String primary , /*String eType ,*/ String resAgent , String reqAgent , String recObjApi, String status){
            this.recId = recId;
            this.ChannelId = channelId;
            this.Primary = primary;
            // this.EventType = eType;
            this.ResponseAgentName = resAgent;
            this.RequestAgentName = reqAgent;
            this.RequestedObjectApiName = getRequestObjectName(recObjApi);
            this.Status = status;
        }

        /**
         * @param String オブジェクトAPI名
         * @discription オブジェクトAPI名を引数として受け取り、チャネル名を返す
         */
        public String getRequestObjectName(String recObjApi){

            switch on recObjApi {
                when 'LiveChatTranscript' {
                    return 'チャット';
                }
                when 'LINE' {
                    return 'LINE';
                }
                when 'VoiceCall' {
                    return '電話';
                }
                when else {
                    return '';
                }
            }
        }
    }
}
