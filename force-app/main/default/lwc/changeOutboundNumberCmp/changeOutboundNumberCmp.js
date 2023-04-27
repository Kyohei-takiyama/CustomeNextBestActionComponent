import { LightningElement, track } from 'lwc';
import Id from '@salesforce/user/Id';
import getOutboundNumber from '@salesforce/apex/VoiceController.getOutboundNumber';
import updateOutboundNumber from '@salesforce/apex/VoiceController.updateOutboundNumber';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OutboundNumberList from '@salesforce/label/c.OutboundNumberList';


export default class ChangeOutboundNumberCmp extends LightningElement {

    outboundNumberList = [];
    initOutboundNumber = '';
    outboundNumber = '';
    isShowUpdateBtn = false;
    userId = Id;
    isProcessing = false;
    isDisabled = false;

    async connectedCallback(){
        this.initOutboundNumber = await getOutboundNumber({userId: this.userId});
        this.initializeOutboundNumber();
        console.log(OutboundNumberList,'OutboundNumberList')
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

    // 番号を初期値に戻す
    initializeOutboundNumber() {
        this.outboundNumber = this.initOutboundNumber;
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

    get outboundNumbers() {
        this.outboundNumberList = [
            { label: '保険金担当', value: '' },
            { label: '貸付担当', value: '' },
            { label: '新規契約担当', value: '' },
        ];
        return this.outboundNumberList;
    }
}
