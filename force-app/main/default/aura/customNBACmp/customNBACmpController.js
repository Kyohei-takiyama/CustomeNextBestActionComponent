({
  // 初期化処理
  init: function (component, evt, helper) {
    const recordId = component.get('v.recordId');
    const STRATEGY_NAME = 'strategyCreateByTAKIYAMA';
    const MAX_RESULTS = 5;
    helper.executeStrategy(component, STRATEGY_NAME, MAX_RESULTS, recordId);
  },
  // 顧客のメッセージを取得処理
  onNewMessage: function (component, evt, helper) {
    // ChatRecordId
    const recordId = evt.getParam('recordId');
    // メッセージ
    const content = evt.getParam('content');
    // 受信メッセージの種別 (エージェントメッセージや訪問者メッセージなど)。
    const type = evt.getParam('type');
    const regexedContent = helper.checkRegex(content);
    // キーワードがあればおすすめを取得
    if (content && regexedContent) {
      helper.getRecommend(component, regexedContent);
    }
    // 禁止語が入力された場合はフラグを上げる
    if (content.indexOf('XXX') >= 0) {
      const isRaisedFlow = component.get('v.isRaisedFlow'); //
      if (isRaisedFlow) return; //
      helper.raiseFlag(component);
    }
  },
  // エージェントのメッセージを取得処理
  onAgentSend: function (component, evt, helper) {
    const recordId = evt.getParam('recordId');
    const content = evt.getParam('content');
    const type = evt.getParam('type');
    const regexedContent = helper.checkRegex(content);
    if (content && regexedContent) {
      helper.getRecommend(component, regexedContent);
    }
  },
  // おすすめメッセージ編集処理
  ondbClickHandler: function (component, evt) {
    component.set('v.isEditDiscription', true);
  },
  // テキストエリアからフォーカスが外れた処理
  blurHandler: function (component, evt) {
    component.set('v.isEditDiscription', false);
  },
  // チャット送信処理
  handleConfirmEvent: function (component, evt, helper) {
    let payload = evt.getParam('payload');
    const { message, isConfirm, targetId } = payload;
    if (isConfirm) {
      const conversationKit = component.find('conversationKit');
      const recordId = component.get('v.recordId');
      conversationKit.sendMessage({
        message: {
          text: message,
        },
        recordId,
      });
      const sendedRecommendIds = component.get('v.sendedRecommendIds');
      sendedRecommendIds.push(targetId);
      component.set('v.sendedRecommendIds', sendedRecommendIds);
    }
    return;
  },
  handleClick: function (cmp, evt, hlp) {},
});