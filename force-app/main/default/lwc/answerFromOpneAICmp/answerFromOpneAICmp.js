import { LightningElement, track } from 'lwc';
import executePost from '@salesforce/apex/ChatGPTMediatorCallout.executePost';

export default class AnswerFromOpneAICmp extends LightningElement {
    question = '';
    answer = '';
    @track
    questionsAndAnswers = {};
    @track
    questionsAndAnswersArr = [];
    URL = '';
    body = JSON.stringify({
        prompt: 'JavaScriptについて教えて',
    });

    changeHandler(e) {
        this.question = e.target.value;
        console.log(this.question);
    }

    async clickHandler() {
        // インデックス指定
        const question = this.question;
        this.question = '';
        const questionAndAnswer = {
            answer: 'Loading...',
            postDT: '',
            question,
        };
        this.questionsAndAnswersArr.push(questionAndAnswer);
        // リクエストBody
        this.body = JSON.stringify({
            prompt: question,
        });
        // リクエスト
        const result = await executePost({ endpoint: this.URL, body: this.body });
        const questionAndAnswerPoped = this.questionsAndAnswersArr.pop();
        questionAndAnswerPoped.answer = result.message.replace(/\r?\n/g, '');
        questionAndAnswerPoped.postDT = this.getCurrentDateTime();
        console.log(result);
        this.questionsAndAnswersArr.push(questionAndAnswerPoped);
        console.log(this.questionsAndAnswersArr);
    }

    generateQAndAArr(questionsAndAnswers) {
        return Object.keys(questionsAndAnswers).map((key) => {
            return [questionsAndAnswers[key].question, questionsAndAnswers[key].answer];
        });
    }

    get isAnswer() {
        return this.answer !== '';
    }

    getCurrentDateTime() {
        const date = new Date();
        return (
            date.getFullYear() +
            '/' +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            '/' +
            ('0' + date.getDate()).slice(-2) +
            ' ' +
            ('0' + date.getHours()).slice(-2) +
            ':' +
            ('0' + date.getMinutes()).slice(-2) +
            ':' +
            ('0' + date.getSeconds()).slice(-2)
        );
    }
}
