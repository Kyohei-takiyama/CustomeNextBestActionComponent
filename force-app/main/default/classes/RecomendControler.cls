/**
 * @description ConnectAPI.NextBestActionを使用したおすすめコントローラクラス
 */
global with sharing class RecomendControler {

    // おすすめレコード取得処理
    @AuraEnabled
    public static List<conAPI_Recommendation> getSingleReccomend(final String message){

        List<conAPI_Recommendation> lst_NBA = new List<conAPI_Recommendation>();
        try {
            if(String.isBlank(message)){
                return lst_NBA;
            }
            // おすすめを取得
            List<Recommendation> lst_recommendation = getRecommendationsByKeyword(new List<Recommendation>(),message);
            for(Recommendation recommendation : lst_recommendation){
                if(String.isNotBlank(recommendation.Id)){
                    // connectAPIからおすすめを取得
                    ConnectApi.Recommendation recommend = ConnectApi.NextBestAction.getRecommendation(recommendation.Id);
                    // 内部クラスをインスタンス化
                    conAPI_Recommendation NBARecommend = new conAPI_Recommendation(recommend);
                    lst_NBA.add(NBARecommend);
                }
            }
            return lst_NBA;
        } catch (Exception e) {
            System.debug(e.getCause() + e.getMessage());
        }
        return lst_NBA;
    }

    /**
     * @description 戦略を実行するメソッド
     * @param String strategyName 戦略名
     * @param Integer maxResults 結果取得最大数
     * @param String contextRecordId 戦略を設定しているレコードId
     * @return ConnectApi.NBARecommendations
            *  ConnectApi.NBARecommendations{
            *      debug:string; おすすめ戦略実行時に記録されたランタイムデバッグ情報。
            *      errors:string; おすすめ戦略実行時に発生したランタイムエラー。
            *      executionId:string; おすすめ戦略実行の ID。
            *      onBehalfOfId:string; 実行されたおすすめ戦略の対象のユーザまたはエンティティの ID。
            *      recommendations:<ConnectApi.​NBARecommendation>[]; おすすめ戦略によって返されたおすすめのリスト。
            *      trace:ConnectApi.​StrategyTrace; おすすめ戦略実行の追跡情報 (要求された場合)。
            *  }
     */
    // 戦略実行処理
    @AuraEnabled
    public static List<conAPI_NBA_Recommendation> getNBARecommendations(final String strategyName,final Integer maxResults,final String contextRecordId){
        List<conAPI_NBA_Recommendation> NBA_recommends = new List<conAPI_NBA_Recommendation>();
        try {
            ConnectApi.NBARecommendations NBARecommend = ConnectApi.NextBestAction.executeStrategy(strategyName, maxResults, contextRecordId);
            for(ConnectApi.NBARecommendation NBA_rec : NBARecommend.recommendations){
                NBA_recommends.add(new conAPI_NBA_Recommendation(NBA_rec));
            }
            return NBA_recommends;
        } catch (Exception e) {
            System.debug(e.getCause() + ' : ' + e.getMessage());
        }
        return NBA_recommends;
    }

    // おすすめ取得メソッド
    public static List<Recommendation> getRecommendationsByKeyword(List<Recommendation> lst_recommendation,final  String keyword){
        String query = 'SELECT Id FROM Recommendation WHERE Name LIKE ';
        query += '\'%' + keyword + '%\'';
        lst_recommendation = Database.query(query);
        return lst_recommendation;
    }

    // 戦略実行メソッドにて取得したConnectApi.NBARecommendationクラスデータを格納するクラス
    public class conAPI_NBA_Recommendation{
        @AuraEnabled public final String acceptanceLabel{get; set;}
        @AuraEnabled public final String description{get; set;}
        @AuraEnabled public final String recommendId{get; set;}
        @AuraEnabled public final String baseUrl{get; set;}
        @AuraEnabled public final String rejectionLabel{get; set;}
        public conAPI_NBA_Recommendation(ConnectApi.NBARecommendation NBA_recommend){
            if(NBA_recommend == null){
                throw new NullPointerException();
            }
            this.acceptanceLabel = NBA_recommend.acceptanceLabel;
            this.description = NBA_recommend.description;
            this.recommendId = NBA_recommend.externalId;
            this.baseUrl = NBA_recommend.imageUrl;
            this.rejectionLabel = NBA_recommend.rejectionLabel;
        }
    }

    // ConnectAPIからおすすめ取得メソッドにて取得したConnectApi.Recommendationクラスデータを格納するクラス
    public class conAPI_Recommendation{
        @AuraEnabled public final String name{get; set;}
        @AuraEnabled public final String description{get; set;}
        @AuraEnabled public final String imageURL{get; set;}
        @AuraEnabled public final String recommendId {get; set;}
        @AuraEnabled public final String recommendName {get; set;}
        @AuraEnabled public final String baseUrl {get; set;}
        public conAPI_Recommendation(ConnectApi.Recommendation recommend){
            if(recommend == null){
                throw new NullPointerException();
            }
            this.name = recommend.name;
            this.description = recommend.description;
            this.imageURL = recommend.url;
            this.recommendId = recommend.id;
            this.recommendName = recommend.name;
            this.baseUrl = recommend.image.baseAssetUrl;
        }
    }
}