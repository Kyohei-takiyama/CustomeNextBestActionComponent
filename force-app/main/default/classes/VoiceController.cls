public with sharing class VoiceController {

    // ユーザの発信通知番号を取得
    @AuraEnabled
    public static String getOutboundNumber(String userId) {
        if(userId == null) {
            return null;
        }
        User user = getUser(userId);
        if(user == null) {
            return null;
        }
        return user.OutboundNumber__c;
    }

    // ユーザの発信通知番号を更新
    @AuraEnabled
    public static String updateOutboundNumber(String userId, String outboundNumber) {
        if(userId == null && outboundNumber == null) {
            return null;
        }
        User user = getUser(userId);
        if(user == null) {
            return null;
        }
        user.OutboundNumber__c = outboundNumber;
        update user;
        return user.OutboundNumber__c;
    }

    // Idからユーザを取得
    public static User getUser(String userId) {
        if(userId == null) {
            return null;
        }
        return [SELECT OutboundNumber__c  FROM User WHERE Id = :userId];
    }
}
