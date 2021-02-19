import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from "../../models/question.model";
// go to previous page
import {Location} from '@angular/common';
import { SubjectApiService } from '../../services/subject-api.service ';
import { SubjectService } from '../../services/subject.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit, OnDestroy {
  subcription: Subscription;
  perPage: number = 10;
  page: number;
  showNewQuestion: boolean = false;
  newQs: any;
  answersArr: any;
  addQuestion: number = 0;
  editQuestion: number = 0;
  public question_id: string;
  public question: Question = null;
  public textLevel = ['', 'Dễ', 'Trung bình', 'Khó'];
  public levels = [ 
    {name:"Dễ", value : 1},
    {name: "Trung bình", value: 2},
    {name: "Khó", value:3}];  
  public subjectname: string;
  public subject_id: string;
  public addQuestionForm:FormGroup;
  constructor(
    public activatedRoute: ActivatedRoute,
    public formBuilder:FormBuilder,
    private router: Router,
    private _location:Location,
    public subjectService: SubjectService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(data => {
      if(data.bo_de){
        this.page = data.trang;
        if(data.cau_hoi){
          this.question_id = data.cau_hoi;
          this.subjectService.loadQuestion(this.question_id);
          this.editQuestion = 1;
          this.addQuestion = -1;
        }
        else{
          this.editQuestion = -1;
          this.addQuestion = 1;
        }
      }
      console.log(data)
    });
    this.subjectService.getSubject().subscribe(data => {
      if(data.question.question){
        console.log(data.question.question[0])
        this.question = data.question.question[0];
        this.createEditQuestionForm();
        this.question.answers.forEach(answer => {
          this.answers.push(this.formBuilder.group({
            content:[answer['content'],Validators.required],
            isCorrect:[answer['isCorrect']]
          }))
        })
      }
      else{
         
      }
    })
    this.createAddQuestionForm();
  }
  ngOnDestroy():void {
    if(this.subcription){
      this.subcription.unsubscribe();
    }
  }
  getSubject_id(id:string){
      this.subject_id = id;
  }
  createEditQuestionForm(){
    this.addQuestionForm = this.formBuilder.group({
      questionTitle:[this.question.title,[Validators.required]],
      level:[this.question.level,[Validators.required]],
      answers:this.formBuilder.array([])
    });
  }
  createAddQuestionForm(){
    this.addQuestionForm = this.formBuilder.group({
      questionTitle:['',[Validators.required]],
      level:[1,[Validators.required]],
      answers: this.formBuilder.array([
        this.newAnswer(),
        this.newAnswer(),
        this.newAnswer(),
      ])
    });
  }
  get answers(): FormArray{
    return this.addQuestionForm.get('answers') as FormArray;
  }
 
  newAnswer():FormGroup{
    return this.formBuilder.group({   
      content:['',[Validators.required]],
      isCorrect:[false]
    })
  }
  addAnswer(){
    this.answers.push(this.newAnswer());
  }
  removeAnswer(i:number){
    this.answers.removeAt(i);
  }
  onSaveQuestion(){
    console.log(this.addQuestionForm.value);
    const newTitle = this.addQuestionForm.value.questionTitle;
    const newAnswer = this.addQuestionForm.value.answers;
    const newLevel = this.addQuestionForm.value.level;
    const newQuestion = new Question(newTitle,newAnswer,newLevel,'',this.subject_id);
    console.log(newQuestion); 
    this.newQs = newQuestion;
    // this.subjectApi.addQuestion(newQuestion).subscribe(data => console.log(data));
    if(this.addQuestion === 1){
      this.subjectService.addQuestion(newQuestion);
    }
    if(this.editQuestion === 1){
      this.subjectService.editQuestion(this.question_id, newQuestion);
    }
    this.showNewQuestion = true;
    // this.addQuestionForm.reset();
    // this.subcription = this.subjectService.getSubject().subscribe(data => {
    //   console.log(data.question.total)
    //   this.page = Math.ceil(data.question.total/this.perPage);
    // })
  }
  onBack(){
    this.showNewQuestion = false;
    this.subcription = this.subjectService.getSubject().subscribe(data => {
      console.log(data.question.total)
    })
    this.router.navigate(['/chi-tiet'], {queryParams: {bo_de: this.subject_id, trang: this.page}})
    // this._location.back();
    
  }
  
}
