import template from './index.hbs';
import QuestionModel from '../../models/Question';

const teacherDataChannel = Radio.channel('teacherData');
const configChannel = Radio.channel('config');

export default Mn.View.extend({

    template,

    events:{
        'click .removeAnswer' : 'removeAnswer',
        'click #addAnswer' : 'addAnswer',
        'click #saveQuestion' : 'saveQuestion'
    },

    initialize: function (options) {

        this.questions = options.questions;
        this.model = new QuestionModel();
        this.model.set('answers', []);

        const minAnswers = configChannel.request('config:get:minAnswers');
        const answers = this.model.get('answers');

        for(let i = 0; i <= minAnswers; i++){
            answers.push('');
        }

        this.listenTo(this.model, 'change:answers', this.onRender, this);

    },

    onRender: function () {

        let correct = this.model.get('correct');
        correct = correct===null ? null : ++correct;

        this.$el.html(this.template({
            question: this.model.get('question'),
            correct: correct,
            answers: this.model.get('answers')
        }));

        return this;

    },

    addAnswer: function (event) {
        event.preventDefault();
        this.saveDateInModel(true);
    },

    saveDateInModel: function (addAnswer=false) {

        const answers = this.model.get('answers').slice();

        $('.answerInput').each(function(){
            answers[this.id] = (this.value);
        });

        if(addAnswer){
            answers.push('');
        }

        this.model.set('question', $('#questionInput')[0].value);

        const correct = --$('#correctInput')[0].value;

        this.model.set('correct', correct!=-1 ? correct : null);
        this.model.set('answers', answers);

    },

    saveQuestion: function (event) {

        event.preventDefault();
        this.saveDateInModel();

        const isSave = teacherDataChannel.request('teacherData:question:add', this.questions , this.model);

        if(isSave){
            Backbone.history.navigate('teacher/edit/' +
            teacherDataChannel.request('teacherData:get:examId'), {trigger: true});
        }

    },

    removeAnswer: function () {

        event.preventDefault();

        let answers = this.model.get('answers').slice();

        $('.answerInput').each(function(){
            answers[this.id] = (this.value);
        });

        answers.splice(event.target.parentElement.getAttribute('data-index'),1);

        this.model.set('question', $('#questionInput')[0].value);

        const correct = --$('#correctInput')[0].value;

        this.model.set('correct', correct!=-1 ? correct : null);
        this.model.set('answers', answers);

    }

});
