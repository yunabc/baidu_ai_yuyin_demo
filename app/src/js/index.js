import '../css/index.styl';
import $ from './jQuery.min.js'
import cookie from './cookie.js'
import HZRecorder from './HZRecorder'
import fetch from 'node-fetch'
// import flexible from "./flexible.min.js"
/*function *like() {
  yield {a:4};
  console.log('test');
}

let it = like();

console.log(it.next().value);//5*/
const localHostName = location.href;

const config = {
	APIKey: 'LuFmtXKTMav8bWNwmfBda7FZ',
	secretKey:" b353e19c2145096d9e6ca2e2e615c",
	cuid:"huanxin_testaudio",
	per: 3  //0为普通女声，1为普通男声，3为情感合成-度逍遥，4为情感合成-度丫丫，默认为普通女声
}

const API ={
	getToken:localHostName+"/oauth/2.0/token",
	upload:localHostName+"/server_api",
	coreDialog:localHostName+"api/v1/core/query?version=20170905",
	transferAudio:localHostName+"/text2audio"



}

let audioObj = {
	init(){
		this.btn = $('.btn');
		this.count = $('.count');
		this.comment = $('.inner'); 
		this.num = 0;
		this.recorder = null;
		this.audio = document.querySelector('audio');
		// this.access_token =  this.token()
		// this.access_token =  {
		// 	"access_token":"24.7f03d7feba435f75332eb89526c1e0a7.2592000.1507353194.282335-10091380",
		// 	"session_key":"9mzdXqFSCiUxzYPCGSMH9q1o0cI0cDZfyTm2THLZ1hKN70t\/CtkX\/ASVkGOXws5six7xb+p4aX3SyctxfKqONrTSftWRcA==",
		// 	"scope":"public audio_voice_assistant_get wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test\u6743\u9650 vis-classify_flower",
		// 	"refresh_token":"25.a73ccf78976ded70d7a59a1048e51656.315360000.1819954377.282335-10091380","session_secret":"ef55b3549e49959351ea68d5b0bb9663",
		// 	"expires_in":2592000}
		this.token();
		// console.log(this.change('我是中国人sdfadf'));
	},
	token(){
		this.access_token =  {
			"access_token":"24.d3a321ea3ca5f774066206592314f593.2592000.1507192668.282335-10096004",
			"session_key":"9mzdXqFSCiUxzYPCGSMH9q1o0cI0cDZfyTm2THLZ1hKN70t\/CtkX\/ASVkGOXws5six7xb+p4aX3SyctxfKqONrTSftWRcA==",
			"scope":"public audio_voice_assistant_get wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test\u6743\u9650 vis-classify_flower",
			"refresh_token":"25.a73ccf78976ded70d7a59a1048e51656.315360000.1819954377.282335-10091380","session_secret":"ef55b3549e49959351ea68d5b0bb9663",
			"expires_in":2592000};
		// if(cookie('token')){
		// 	let accessObj = JSON.parse(cookie('token'));
		// 	if((Date.noew() - accessObj.expires_in)/1000/60/60/24 > 28){
		// 		this.getToken()
		// 	}
		// 	this.acess_token = accessObj;
			this.bindEvent();
		// }else{
		// 	this.getToken()
			this.welcoming()

		// }
	},
	welcoming(){
		this.getAudio('');
	},
	getToken(){
		const obj = {
			grant_type: "client_credentials",
			client_id: config.APIKey,
			client_secret: config.secretKey
		};

		this.fetchToken(obj).then((res)=>{

			res.expires_in = Date.now();
			cookie('token',JSON.stringify(res));
			this.access_token = res;
			this.bindEvent();

		})

	},
	fetchToken(data){
		return new Promise((resolve,reject)=>{
			$.ajax({
				url:API.getToken,
				data: data,
				"header":
					{
						 "Authorization": "AICP 4cf0ebd2-db1b-44fc-8e30-7e9ceca0cb76"
						},
				type:'get',
				// dataType:'jsonp',
				success:function(res){
					resolve(res);
				},
				failed:function(err){
					reject(err);
				}

			})
			
		})
	},
	serialize(obj){
		let str = '';
		for( let key in obj){
			str += key + '=' + $.trim(obj[key]) + '&';
		}
		return str.substring(0,str.length-1);

	},
	bindEvent(){
		var isTouch = 'ontouchstart' in window
    var mouseEvents = (isTouch) ?
    {
        down: 'touchstart',
        move: 'touchmove',
        up: 'touchend',
        over: 'touchstart',
        out: 'touchend'
    }
            :
    {
        down: 'mousedown',
        move: 'mousemove',
        up: 'mouseup',
        over: 'mouseover',
        out: 'mouseout'
    }
		var that = this;
		this.btn.on(mouseEvents.down,function(){
			console.log('mousedown')
			$(this).addClass('touching');
			that.audio.pause();
      HZRecorder.get(function (rec) {
        that.recorder = rec;
        that.recorder.start();
        that.renderCount();
      },{sampleBits:16});
		}).on(mouseEvents.up,function(){
			clearInterval(that.timer);
			$(this).removeClass('touching')
			that.num = 0;
			that.recorder.stop();
			// that.recorder.play(that.audio);
			// 我的语音转成文字
			that.upload();
			// console.log('我的语音转成文字',JSON.stringify(myWord));
		
			// // 机器人的回答文字
			// let answer = that.getAnswer(myWord.result[0]).next().value.body;
			

			// // 文字转语音
			// that.answerAudio(answer.data.suggest_answer)

		})

	},
	renderCount(){
		this.count.text('0s')
		this.timer = setInterval(()=>{
			this.num++
			this.count.text(this.num+'s')
		},1000)
	},
	answerAudio(str){
		let data = {
			tex:str,
			lan:"zh",
			tok:this.access_token.access_token,
			ctp:1,
			cuid:config.cuid,
			per:config.per
		}
		console.log(API.transferAudio +'?'+this.serialize(data));
		this.audio.src = API.transferAudio +'?'+this.serialize(data);
		// fetch(API.transferAudio,{method:"GET",body:this.serialize(data)})
		 //return new Promise((resolve,reject)=>{
			// $.ajax({
			// 	url:API.transferAudio,
			// 	type:"get",
			// 	// dataType:"json",
			// 	data:data,
			// 	// headers:{
   //  //         "Authorization":'AICP 4cf0ebd2-db1b-44fc-8e30-7e9ceca0cb76'
   //  //     },
			// 	success:function(res){
			// 		resolve(res);
			// 	},
			// 	failed:function(err){
			// 		reject(err);
			// 	}
			// })
			
		//})
	},
	getAnswer(str){
		var that = this;
		return new Promise((resolve,reject)=>{
			$.ajax({
				url:API.coreDialog,
				type:"post",
				data:JSON.stringify({
					session_id:''|| this.session_id,
					query_text:str
				}),
				headers:{
            "Authorization":'AICP 4cf0ebd2-db1b-44fc-8e30-7e9ceca0cb76'
        },
				success:function(res){
					resolve(res);
				},
				failed:function(err){
					reject(err);
				}
			})
			
		})
	},
	upload(){
		// this.renderMyword('你好');
		// this.renderRobotword('hello');
		let that = this;
		this.recorder.upload(API.upload,this.access_token.access_token,config.cuid).then((res)=>{
			// console.log(res);
			// const res = {"corpus_no":"6462887425561596494","err_msg":"success.","err_no":0,"result":["天气不错，"],"sn":"463172475921504758239"}

			if(res.err_msg&&res.err_msg == 'success.'){
				that.renderMyword(res.result[0]);
				that.getAudio(res.result[0]);
				// return that.getAnswer();
			}else{
				alert(res.err_msg);
			}

		})
		//.then((res)=>{
		// 	console.log(res);
		// 	// var res={"code":200,"time":1504759179900,"msg":"ok","data":{"suggest_answer":"抱歉,我不太理解您的意思","answer":null,"session_id":"e003fe88-900c-4197-bea2-1b456551a4de","source":"none"}}
		// 	if(res.code == 200){
		// 		this.renderRobotword(res.data.suggest_answer);
		// 		this.answerAudio(res.data.suggest_answer);
		// 	}else{
		// 		alert(res.msg);
		// 	}
		// }).then((res)=>{

		// 	console.log(res)
  //     this.audio.src = window.URL.createObjectURL(res);

		// })
		
	},
	getAudio(str){
		this.getAnswer(str).then(res =>{
			if(res.code == 200){
				this.session_id = res.data.session_id;
				this.renderRobotword(res.data.suggest_answer);
				this.answerAudio(res.data.suggest_answer);
			}else{
				alert(res.msg);
			}
		})

	},
	renderMyword(str){
		this.compileWord('my',str);
	},
	renderRobotword(str){
		this.compileWord('robot',str);

	},
	compileWord(role,str){
		$(`<div class=${role}>${str}<div>`).appendTo(this.comment)
	},
	change(pValue){
		return pValue.replace(/[^\u0000-\u00FF]/g,function($0){return escape($0).replace(/(%u)(\w{4})/gi,"&#x$2;")});
	}
	
}

audioObj.init();


