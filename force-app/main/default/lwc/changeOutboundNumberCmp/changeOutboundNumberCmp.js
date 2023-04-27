import { LightningElement } from 'lwc';
import Id from '@salesforce/user/Id';
import getOutboundNumber from '@salesforce/apex/VoiceController.getOutboundNumber';
import updateOutboundNumber from '@salesforce/apex/VoiceController.updateOutboundNumber';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OutboundNumberListLabel from '@salesforce/label/c.OutboundNumberList';


export default class ChangeOutboundNumberCmp extends LightningElement {

    outboundNumberList = [];
    initOutboundNumber = '';
    outboundNumber = '';
    isShowUpdateBtn = false;
    userId = Id;
    isProcessing = false;
    isDisabled = false;

    async connectedCallback(){
        // 通知先番号のリストを初期化
        this.initializeOutboundNumberList();
        this.initOutboundNumber = await getOutboundNumber({userId: this.userId});
        this.initializeOutboundNumber();
    }

    handleChange(event) {
        this.changeOutboundNumber(event.detail.value);
        this.displayUpdateBtn();
    }

    changeOutboundNumber(newNumber) {
        this.outboundNumber = newNumber;
    }

    handleCancel() {
        this.hiddenUpdateBtn();
        this.initializeOutboundNumber();
    }

    // 番号を更新
    async handleUpdate() {
        this.startProcess();
        // 電話番号を更新
        this.initOutboundNumber = await updateOutboundNumber({userId: this.userId, outboundNumber: this.outboundNumber});
        if(!this.initOutboundNumber) {
            this.showNotification('エラー', '電話番号の更新に失敗しました。', 'error');
        } else {
            this.showNotification('成功', '電話番号を更新しました。', 'success');
        }
        this.initializeOutboundNumber();
        this.hiddenUpdateBtn();
        this.doneProcess();
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }

    /**
     * @description 通知先番号のリストを初期化
     * @variable OutboundNumberListLabelがカスタム表示ラベルで、「部署名,発信通知番号;」の形式で設定する
     */
    initializeOutboundNumberList(){
        OutboundNumberListLabel.split(';').forEach(text => {
            const [label, value] = text.split(',');
            this.outboundNumberList.push({ label, value });
        })
    }

    // 番号を初期値に戻す
    initializeOutboundNumber() {
        this.outboundNumber = this.initOutboundNumber;
    }

    startProcess () {
        this.isDisabled = true;
        this.isProcessing = true;
    }

    doneProcess () {
        this.isDisabled = false;
        this.isProcessing = false;
    }

    displayUpdateBtn() {
        this.isShowUpdateBtn = true;
    }

    hiddenUpdateBtn() {
        this.isShowUpdateBtn = false;
    }
}
