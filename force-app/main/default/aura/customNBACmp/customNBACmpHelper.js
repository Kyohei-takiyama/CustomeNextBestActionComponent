({
    // Apexからおすすめを取得
    getRecommend: function(component, content){
        let recommends = component.get("v.recommends");
        const action = component.get("c.getSingleReccomend");
        action.setParams({"message":content})
        action.setCallback(this , response => {
            const state = response.getState();
            if(state === "SUCCESS"){
                const data = response.getReturnValue();
                if(data.length > 0){
                    // 重複排除
                    const deDuplicatedArr = this.removeDuplication(recommends,data);
                    // 送信済みのおすすめを排除
                    const sendedRecommendIds = component.get("v.sendedRecommendIds");
                    const newRecommends = this.removeRecommendSubmited(deDuplicatedArr,sendedRecommendIds);
                     component.set("v.recommends" , newRecommends);
                    // おすすめ表示条件
                    if(newRecommends.length > 0){
                        component.set("v.isShowReccomends",true);
                    } else if(newRecommends.length === 0) component.set("v.isShowReccomends",false);
                }
            } else {
                console.error("get SingleRecomends error" , response.getError());
            }
        })
        $A.enqueueAction(action);
    },
    // Apexから戦略を実行し、おすすめを取得
    executeStrategy:function(component,strategyName,maxResults,recordId){
        let recommends = component.get("v.recommends");
        const action = component.get("c.getNBARecommendations");
        action.setParams({
            "strategyName":strategyName,
            "maxResults":maxResults,
            "contextRecordId":recordId
        })
        action.setCallback(this,response => {
            const state = response.getState();
            if(state === "SUCCESS"){
                const data = response.getReturnValue();
                console.log(data);
                if(data.length > 0){
                    // 重複排除
                    const deDuplicatedArr = this.removeDuplication(recommends,data);
                     component.set("v.recommends" , newRecommends);
                    // おすすめ表示条件
                    if(deDuplicatedArr.length > 0){
                        component.set("v.isShowReccomends",true);
                    } else if(deDuplicatedArr.length === 0) component.set("v.isShowReccomends",false);
                }
            }
        })
        $A.enqueueAction(action);
    },
    // 重複排除処理
    removeDuplication:function(recommends , data){
        // 重複削除用hashMap
        let hashMap = {};
        return [...recommends,...data].filter(rec => {
            if(!hashMap[rec.recommendId]){
                hashMap[rec.recommendId] = rec.recommendId;
                return rec;
            }
        })
    },
    // おすすめ抽出ロジック
    checkRegex:function (content){
        const regexPassword = content.match(/^(?=.*パスワード).*$/)
        const regexNyuin = content.match(/^(?=.*入院).*$/)
        const regexHokenkin = content.match(/^(?=.*保険金).*$/)
        if(regexPassword) return "パスワード";
        if(regexNyuin) return "入院";
        if(regexHokenkin) return "保険金";
        return "";
    },
    // 送信済みかチェック
    removeRecommendSubmited:function(recommends,sendedRecommendIds){
        return recommends.filter(rec => {
            return !sendedRecommendIds.includes(rec.recommendId);
        })
    },
    // トースト処理
    showToast:function(toastConfig){
        const {type , title , message} = toastConfig;
        const toastEvent = $A.get('e.force:showToast');
        toastEvent.setParams({
            mode: "sticky",
            message,
            title,
            type
        });
        toastEvent.fire();
    },
    raiseFlag:function(component){
        const omniAPI = component.find("omniToolkit");
        omniAPI.getAgentWorks()
        .then(function(result) {
            const isRaisedFlow = component.get("v.isRaisedFlow");//
            const works = JSON.parse(result.works);
            const work = works[0];
            if(isRaisedFlow) return
            component.set("v.isRaisedFlow",true);//
            omniAPI.raiseAgentWorkFlag({workId:work.workId,message:"test"})
        }).catch(function(error) {
            console.log(error);
        });
    },
})