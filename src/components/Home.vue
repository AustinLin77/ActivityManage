<template>
  <div class="whole">
    <mu-popup position="top" :overlay="false" popupClass="demo-popup-top" :open="topPopup">
      此选项下暂无数据
    </mu-popup>
    <div class="top">
      <mu-tabs :value="activeTab" @change="handleTabChange">
        <mu-tab value="tab1" title="未签到" @click="noSign"/>
        <mu-tab value="tab2" title="未离开" @click="noLeave"/>
        <mu-tab value="tab3"  title="已离开" @click="AlComplete"/>
        <mu-tab value="tab4" title="已取消" @click="AlCancel"/>
        <mu-tab value="tab5" title="已爽约" @click="breakSign" />
        <mu-tab value="tab6"  title="黑名单" @click="blackPeople"/>
      </mu-tabs>
      <div class="select" v-show="selectStatus!=6">
        <div class="starter">厂区 : </div>
        <div class="ender">
          <mu-select-field v-model="area"  hintText="选择厂区" @input="getRoomList">
            <mu-menu-item v-for="item,index in areaList" :key="index" :value="item.AREA_ID" :title="item.AREA_NAME"  />
          </mu-select-field>
          <mu-select-field v-model="room"  hintText="选择活动室">
            <mu-menu-item v-for="item,index in roomList" :key="index" :value="item.roomId" :title="item.roomName"  />
          </mu-select-field>
        </div>
      </div>
      <div v-show="selectStatus!=6">
        <form class="form" v-if="selectStatus==4||selectStatus==5">
        <span class="time">
            <mu-date-picker hintText="选择时间" style="width: 115px;height: 30px;" v-model="myDate"/>
        </span>

          <input   type="search"  placeholder="输入工号/姓名首字母" class="input" v-model="condition">
          <i class="iconfont icon-3 search" @click="search"></i>
        </form>
        <form class="form" v-else="">
          <input   type="search"  placeholder="输入工号/姓名首字母" class="input" v-model="condition">
          <i class="iconfont icon-3 search" @click="search"></i>
        </form>
      </div>


    </div>
    <div class="content" v-if="selectStatus==6">
      <div v-for="item,index in blackList">
        <div class="blackPeople" >
          <div class="name">{{index+1}} : {{item.userName}}</div>
          <div class="userNo">{{item.personId}}</div>
          <div class="myDel">
            <mu-raised-button label="取消" class="demo-raised-button mytButton" primary @click="removeBlack(item.userNo)"/>
          </div>
        </div>
        <div class="blackTime">
          <div class="startTime">
            <span style="font-size: 14px">开始时间 : </span><span style="color: darkgrey">{{item.createDateStr}}</span>
          </div>
          <div class="endTime">
            <span style="font-size: 14px">结束时间 : </span><span style="color: darkgrey">{{item.endDateStr}}</span>
          </div>
        </div>
      </div>

    </div>
    <div class="content" v-else>
      <div class="outer" v-for="i in signData">
        <div class="firstD">
          <div class="start">{{i.roomName}}</div>
          <div class="end">
            <mu-raised-button label="签到" class="demo-raised-button myButton" primary v-if="selectStatus==1" @click="adminSign(i,1)"/>
            <mu-raised-button label="签离" class="demo-raised-button myButton" primary v-if="selectStatus==2" @click="adminSign(i,4)"/>
            <span v-if="selectStatus==3" style="color:#4682B4 ">已完成</span>
            <span v-if="selectStatus==4" style="color:#4682B4 ">已取消</span>
            <span v-if="selectStatus==5" style="color:#4682B4 ">已爽约</span>
          </div>
        </div>
        <div class="middleD">
          <div class="front">
            <span class=key>预约人 : </span>
            <span class="value">{{i.userName}}</span>
          </div>
          <div class="back">
            <mu-raised-button label="爽约" class="demo-raised-button myOButton" primary v-if="selectStatus==1" @click="adminSign(i,3)"/>
          </div>
        </div>
        <div class="secondD">
          <!--<div class="item">-->
            <!--<span class=key>预约人 : </span>-->
            <!--<span class="value">林国铿</span>-->
          <!--</div>-->
          <div class="item">
            <span class=key>预约时间 : </span>
            <span class="value">{{i.dateTime}} {{i.startDateStr}}-{{i.endDateStr}}</span>
          </div>
          <div class="item" v-if="selectStatus==4">
            <span class=key>取消时间 : </span>
            <span class="value">{{i.cancleDateStr.substr(0,16)}}</span>
          </div>
        </div>
        <div style="height: 1px;width: 100%;background-color: #eeeeee;margin-top: 10px"></div>
      </div>
    </div>


  </div>

</template>

<script>
export default {
  data () {
    return {
      activeTab: 'tab1',
      area:'',
      room:'',
      areaList:[],
      roomList:[],
      noTime:false,
      selectStatus:1,
      signData:[],
      topPopup: false,
      blackList:[],
      currentDate:'',
      condition:'',
      myDate:''
    }
  },
  watch: {
    topPopup (val) {
      if (val) {
        setTimeout(() => {
          this.topPopup = false
        }, 2000)
      }
    }
  },
  mounted(){
    localStorage.setItem("token",this.$route.query.token);
    console.log(localStorage.getItem("token"));
    this.getAreas();
    this.getMyDate()
  },
  methods:{
    removeBlack(userNo){
      let vm=this;
      $.ajax({
        url: vm.path+'updateActivityBlack.json',
        dataType: "json",
        data: {
          token:localStorage.getItem("token"),
          blackUsers:userNo
        },
        type: "post",
        success: function (res) {
          console.log(res);
          if (res.message == '操作成功') {
            alert("操作成功");
            vm. blackPeople()
          }
        },
        error: function () {
        }
      });
    },
    getMyDate(){
      var seperator1 = "-";
      var date=new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var strDate = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      this.currentDate = year + seperator1 + month + seperator1 + strDate;
      this.getData(0);
      console.log(this.currentDate);

//            this.dateData[this.flag].label=this.currentDate;
//            this.flag++
    },
    search(){
      console.log(this.area);
      console.log(this.room)
      var type='';
      switch(this.selectStatus) {
        case 1:
         type=0;
          break;
        case 2:
          type=1;
          break;
        case 3:
          type=4;
          break;
        case 4:
          type=2;
          break;
        case 5:
          type=3;
          break;
      }
      let vm=this;
      $.ajax({
        url: vm.path+'findActivityBookListByRoom.json',
        dataType: "json",
        data: {
          type:type,
          token:localStorage.getItem("token"),
          condition:vm.condition,
          date:vm.myDate,
          areaId:vm.area,
          roomId:vm.room,
        },
        type: "get",
        success: function (res) {
          console.log(res);
          vm.signData=res.dataInfo.listData;
          if(vm.signData.length==0){
            vm.topPopup = true
          }
        },
        error: function () {
        }
      });
    },
    getData(type){
      let vm=this;
      $.ajax({
        url: vm.path+'findActivityBookListByRoom.json',
        dataType: "json",
        data: {
          type:type,
          token:localStorage.getItem("token"),
          date:vm.currentDate
        },
        type: "get",
        success: function (res) {
          console.log(res);
          vm.signData=res.dataInfo.listData;
          if(vm.signData.length==0){
            vm.topPopup = true
          }
        },
        error: function () {
        }
      });
    },
    adminSign(i,t){
      let vm = this;
      $.ajax({
        url: vm.path + 'setBespeakStatus.json',
        dataType: "json",
        data: {
          bookId: i.bookId,
          token: localStorage.getItem("token"),
          status: t
        },
        type: "post",
        success: function (res) {
          console.log(res);
          if (res.message == '操作成功') {
           alert("操作成功");
           if(t==1||t==3){
             vm.getData(0)
           }else if(t==4){
             vm.getData(1)
           }

          }
        },
        error: function () {
        }
      });
    },
    noSign(){
      this.selectStatus=1;
      this.myDate='';
      this.area='';
      this.room='';
      this.condition='';
      this.getData(0);
    },
    noLeave(){
      this.selectStatus=2;
      this.myDate='';
      this.area='';
      this.room='';
      this.condition='';
      this.getData(1);
    },
    AlComplete(){
      this.selectStatus=3;
      this.myDate='';
      this.area='';
      this.room='';
      this.condition='';
      this.getData(4);
    },
    AlCancel(){
      this.selectStatus=4;
      this.myDate='';
      this.area='';
      this.room='';
      this.condition='';
      this.getData(2);
    },
    breakSign(){
      this.selectStatus=5;
      this.myDate='';
      this.area='';
      this.room='';
      this.condition='';
      this.getData(3);
    },
    blackPeople(){
      this.selectStatus=6;
      let vm = this;
      $.ajax({
        url: vm.path + 'findActivityBlack.json',
        dataType: "json",
        data: {
        },
        type: "get",
        success: function (res) {
          console.log(res);
          vm.blackList=res.dataInfo.listData;
          if(vm.blackList.length==0){
            vm.topPopup = true
          }
        },
        error: function () {
        }
      });
    },
    getAreas(){
      let vm=this;
      $.ajax({
        url: vm.path+'findActivityFactoryList.json',
        dataType: "json",
        data: {
        },
        type: "get",
        success: function (res) {
          console.log(res);
          vm.areaList =res.dataInfo.listData;
          console.log(vm.areaList)
        },
        error: function () {
        }
      });
    },
    getRoomList(){
      let vm=this;
      console.log(this.area);
      $.ajax({
        url: vm.path+'findActivityRoomList.json',
        dataType: "json",
        data: {
          areaId:vm.area,
          token:localStorage.getItem("token")
        },
        type: "get",
        success: function (res) {
          console.log(res);
          vm.roomList=res.dataInfo.listData;

        },
        error: function () {
        }
      });
    },
    handleTabChange(val){
      this.activeTab = val
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .whole{
    display: flex;
    flex-direction:column;
    width: 100%;
    height: 100%;
  }
 .top{
   width: 100%;
   .select{
     width: 100%;
     padding: 5px 10px 5px 10px;
     height: 50px;
     box-sizing: border-box;
     display: flex;
     align-items: center;
     border-bottom: 1px solid #eeeeee;
     .starter{
       width: 60px;
       font-size: 16px;
       color: #4682B4;
     }
     .ender{
       flex:1

     }
   }
   .form{
     padding:0 10px 0 10px;
     width: 100%;
     text-align: center;
     height: 50px;
     position: relative;
     display: flex;
     align-items: center;
   }
   .input{
     flex: 1;
     height: 32px;
     padding-left: 10px;
     border: 1px solid #DBDBDB;
     border-radius: 3px;
     outline: none;
     background: #eeeeee;
     color: dimgrey;
   }
   .time{
     width: 130px;
     height: 32px;
     padding-left: 10px;
     border: 1px solid #DBDBDB;
     border-radius: 3px;
     outline: none;
     background: #eeeeee;
     color: dimgrey;
     margin-right: 15px;
   }
   .search{
     height: 20px;
     font-size: 20px;
     position: absolute;
     color:#cccccc;
     top:12px;
     right:20px;
   }
 }
 .outer{
   width: 100%;
   padding: 0 10px 10px 10px;
   background-color: white;
 }
 .firstD{
   height: 30px;
   display: flex;
   align-items: center;
   justify-content:flex-end;
 }
 .start{
   flex: 1;
   height: 30px;
   line-height: 30px;
   color: #4682B4;
   font-size: 16px;
   font-weight: bold;
 }
 .end{
   display: flex;
   justify-content: flex-end;
   width: 100px;
   height: 30px;
   color: #009688;
   font-size: 16px;
   .myButton{
     height: 25px;
     min-width: 60px;
   }
 }
 .secondD{
   padding: 0 10px 0 10px;
   /*height: 120px;*/
   width: 100%;
   box-sizing: border-box;
 }
 .item{
   height: 28px;
   display: flex;
   align-items: center;
   justify-content: flex-start;
 }
 .key{
   height: 28px;
   color:darkgrey;
   /*width: 100px;*/
   font-size: 16px;
 }
 .value{
   margin-left: 10px;
   height: 28px;
   flex:1;
   color: black;
   font-size: 16px;
 }
 .thirdD{
   text-align: right;
 }
  .content{
     flex: 1;
    overflow: scroll;
  }
  .middleD{
    padding-left: 10px;
    margin-top: 10px;
    width: 100%;
    height: 30px;
    display: flex;
  }
  .back{
    height: 30px;
    width: 100px;
    text-align: right;
    .myOButton{
      height: 25px;
      min-width: 60px;
    }
  }
  .front{
    flex: 1;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .blackPeople{
    width: 100%;
    height: 50px;
    padding: 10px 15px 10px 10px;
    display: flex;
    align-items: center;
    font-size: 16px;
    .name{
      flex:2;

    }
    .userNo{
      flex:4;
    }
    .myDel{
      display: flex;
      justify-content: flex-end;
      flex:2;
      height: 30px;
      .mytButton{
        width: 60px;
        height: 28px;
      }
    }
  }
  .blackTime{
    font-size: 16px;
    width: 100%;
    height: 30px;
    display: flex;
    border-bottom: 1px solid #eeeeee;
    /*align-items: center;*/
    padding: 0 10px 0 10px;
    .startTime{
      flex:1;
    }
    .endTime{
      flex:1;
    }
  }
</style>
